// Importa as bibliotecas necessárias
const qrcode = require('qrcode-terminal'); // Para exibir o código QR
const { Client } = require('whatsapp-web.js'); // Para criar o cliente WhatsApp
const fs = require('fs'); // Para lidar com o sistema de arquivos

// Cria uma instância do cliente WhatsApp
const client = new Client({});
let qrCodeData = null; // Variável para armazenar os dados do código QR

// Verifica se existe um arquivo com o código QR salvo
if (fs.existsSync('qr-code.txt')) {
  qrCodeData = fs.readFileSync('qr-code.txt', 'utf-8');
}

// Define um evento para exibir o código QR quando estiver disponível
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  // Salva o código QR em um arquivo para uso posterior
  fs.writeFileSync('qr-code.txt', qr);
});

// Define um evento para quando o cliente estiver pronto
client.on('ready', () => {
  console.log('Conectado com SUCESSO!!');
});

// Define um evento para lidar com as mensagens recebidas
client.on('message', handleMessage);

let lastActivityTime = new Map(); // Usado para rastrear a última atividade por usuário
let waitingForRating = new Map(); // Usado para rastrear se estamos esperando por avaliações
let trackingDisabled = false; // Estado global de rastreamento desativado
let disableTrackingTime = 15 * 60 * 1000; // 15 minutos em milissegundos

// Função para lidar com as mensagens recebidas
async function handleMessage(message) {
  if (!message.isGroupMsg) {
    const user = message.from;
    const userOption = parseInt(message.body);
    const isFirstMessage = !lastActivityTime.has(user);

    if (isFirstMessage) {
      sendWelcomeMessage(user); // Envia uma mensagem de saudação para a primeira mensagem do usuário
    } else {
      lastActivityTime.set(user, new Date()); // Atualiza o tempo da última atividade para o usuário
    }

    // Verifica se o dia da semana atual está entre segunda (1) e sexta (5)
    // e se a hora atual está entre 9h e 21h30 (21.5 horas).
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const currentHour = currentDate.getHours();
    const isValidTime = currentDayOfWeek >= 1 && currentDayOfWeek <= 5 && currentHour >= 9 && currentHour < 21.5;

    switch (userOption) {
      case 1:
      case 2:
        if (!trackingDisabled) {
          if (isValidTime) {
            trackingDisabled = true; // Desabilita temporariamente o rastreamento global
            await client.sendMessage(user, `Você escolheu falar com o ${userOption === 1 ? 'Financeiro' : 'Secretaria'}. Aguarde um momento.`);
            setTimeout(() => { trackingDisabled = false; }, 900000); // Reabilita o rastreamento após 15 minutos
          } else {
            await client.sendMessage(user, 'Desculpe, estamos disponíveis apenas de segunda a sexta, das 9h às 21h30. Por favor, entre em contato depois.');
          }
        } else {
          await client.sendMessage(user, `Assim que possível uma de nossas atendentes responderá. Por favor, aguarde.`);
        }
        break;
      case 3: // Nova opção: Falar com o Colégio/Pós-Graduação
        if (!trackingDisabled) {
          if (isValidTime) {
            trackingDisabled = true; // Desabilita temporariamente o rastreamento global
            await client.sendMessage(user, 'Você escolheu falar com o Colégio/Pós-Graduação. Aguarde um momento.');
            setTimeout(() => { trackingDisabled = false; }, disableTrackingTime); // Reabilita o rastreamento após 15 minutos
          } else {
            await client.sendMessage(user, 'Desculpe, estamos disponíveis apenas de segunda a sexta, das 9h às 21h30. Por favor, entre em contato depois.');
          }
        } else {
          await client.sendMessage(user, 'Assim que possível uma de nossas atendentes responderá. Por favor, aguarde.');
        }
        break;
      case 4: // Nova opção: Datas Importantes
        await showDates(user);
        break;
      case 5:
        sendRequirementsInstructions(user);
        break;
      case 6: // Nova opção: Ver o menu novamente
        sendWelcomeMessage(user);
        break;
      case 7:
        showEventSpaces(user);
        break;
    }
  }
}

// Função para enviar a mensagem de boas-vindas
function sendWelcomeMessage(user) {
  const welcomeMessage = 'Bem-vindo sou a Rosi e estou em versão de testes! Como posso ajudar?\n' +
    '1. Falar com o Financeiro.\n' +
    '2. Falar com a Secretaria.\n' +
    '3. Falar com o Colégio/Pós-Graduação.\n' + // Nova opção: Falar com o Colégio/Pós-Graduação
    '4. Datas Importantes.\n' + // Nova opção: Datas Importantes
    '5. Requerimentos.\n' +
    '6. Ver o menu novamente.\n' + // Nova opção: Ver o menu novamente
    '7. Locação de Espaços para Eventos.';
  client.sendMessage(user, welcomeMessage);
}

// Inicializa o cliente WhatsApp
client.initialize();

// Definição das datas importantes
const dates = {
  'Data de Matrícula': ['A DEFINIR', 'A DEFINIR'],
  'Data de Rematrícula': ['A DEFINIR', 'A DEFINIR'],
  'Data de Provas': ['A DEFINIR', 'A DEFINIR', 'A DEFINIR'],
  'Data de Vestibular': ['A DEFINIR'],
};

// Função para mostrar as datas importantes
async function showDates(user) {
  const datesText = Object.keys(dates).map((option, index) => {
    const dateList = dates[option].join(', ');
    return `${index + 1}. ${option}: ${dateList}`;
  }).join('\n');

  await client.sendMessage(user, 'Datas Importantes:\n' + datesText);
}

// Função para enviar instruções sobre requerimentos
async function sendRequirementsInstructions(user) {
  const instructions = 'Para fazer requerimentos, siga as instruções abaixo:\n' +
    '1. Acesse o portal do aluno: https://isulpar.jacad.com.br/academico/aluno-v2/login\n' +
    '2. Coloque seu CPF no login e a senha é sua data de nascimento (ex: 01011991 sem / ou -)\n' +
    '3. Clique em "Secretaria" e em seguida em "Requerimentos"\n' +
    '4. Clique no botão roxo escrito "+ Solicitar Requerimento"\n' +
    '5. Selecione sua matrícula e o tipo de requerimento\n' +
    '6. Em caso de alteração de data de vencimento, a nova data deve ser informada na observação.';

  await client.sendMessage(user, instructions);
}

// Função para mostrar informações sobre espaços para eventos
async function showEventSpaces(user) {
  const eventSpacesInfo = 'Está interessado em alugar espaços para eventos? Entre em contato conosco pelo e-mail consultor@isulpar.edu.br para verificar a disponibilidade e solicitar a locação. Teremos prazer em fornecer informações detalhadas sobre nossos espaços e serviços para eventos.';

  await client.sendMessage(user, eventSpacesInfo);
}

// Função para verificar a inatividade do usuário
function checkActivity() {
  const currentTime = new Date();
  const inactiveDuration = 10; // Define o período de inatividade desejado em minutos (por exemplo, 10 minutos)

  lastActivityTime.forEach((activityTime, user) => {
    const timeDifference = (currentTime - activityTime) / (1000 * 60); // Diferença em minutos

    if (!trackingDisabled && timeDifference >= inactiveDuration) {
      const inactivityMessage = 'Olá! Fique à vontade para me chamar novamente, digite 6 para ver o menu.';
      client.sendMessage(user, inactivityMessage);

      if (!waitingForRating.get(user)) sendRatingPrompt(user);
      waitingForRating.set(user, true);
    }
  });

  setTimeout(checkActivity, 600000); // Verifica a inatividade a cada 10 minutos (600,000 milissegundos)
}

// Função para enviar a mensagem de avaliação
function sendRatingPrompt(user) {
  const ratingPromptMessage = 'Por favor, avalie o nosso serviço de atendimento. Digite uma pontuação de 1 a 5, onde 1 é ruim e 5 é excelente.';
  client.sendMessage(user, ratingPromptMessage);
}

// Inicia o rastreamento de inatividade
checkActivity();