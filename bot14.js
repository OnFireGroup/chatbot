const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fs = require('fs');

const client = new Client({});
let qrCodeData = null;

// Verifique se existe um arquivo com o código QR salvo
if (fs.existsSync('qr-code.txt')) {
  qrCodeData = fs.readFileSync('qr-code.txt', 'utf-8');
}

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  // Salve o código QR em um arquivo para uso posterior
  fs.writeFileSync('qr-code.txt', qr);
});

client.on('ready', () => {
  console.log('Conectado com SUCESSO!!');
});

client.on('message', handleMessage);

let lastActivityTime = new Map(); // Usamos um mapa para rastrear a última atividade por usuário
let waitingForRating = new Map(); // Usamos um mapa para rastrear se estamos esperando por avaliações
let trackingDisabled = false; // Estado global de rastreamento desativado
let welcomeMessageSent = {};

async function handleMessage(message) {
  if (!message.isGroupMsg) {
    const user = message.from;
    const userOption = parseInt(message.body);
    const isFirstMessage = !welcomeMessageSent[user];

    if (isFirstMessage) {
      sendWelcomeMessage(user);
      welcomeMessageSent[user] = true;
    } else {
      lastActivityTime.set(user, new Date());
    }

    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    const currentHour = currentDate.getHours();
    const isValidTime = currentDayOfWeek >= 1 && currentDayOfWeek <= 5 && currentHour >= 9 && currentHour < 21.5;

    switch (userOption) {
      case 1:
      case 2:
      case 3:
        if (!trackingDisabled) {
          if (isValidTime) {
            trackingDisabled = true;
            await client.sendMessage(user, `Você escolheu falar com o ${userOption === 1 ? 'Financeiro' : userOption === 2 ? 'Secretaria' : 'Colégio/Pós-Graduação'}. Aguarde um momento.`);
            setTimeout(() => { trackingDisabled = false; }, 900000);
          } else {
            await client.sendMessage(user, 'Desculpe, estamos disponíveis apenas de segunda a sexta, das 9h às 21h30. Por favor, entre em contato depois.');
          }
        } else {
          await client.sendMessage(user, `Já estou atendendo sua solicitação. Por favor, aguarde.`);
        }
        break;
      case 4:
        showDates(user);
        break;
      case 5:
        sendRequirementsInstructions(user);
        break;
      case 6:
        showEventSpaces(user);
        break;
      case 7:
        sendWelcomeMessage(user);
        break;
    }
  }
}

function sendWelcomeMessage(user) {
  const welcomeMessage = 'Bem-vindo sou a Rosi e estou em versão de testes! Como posso ajudar?\n' +
    '1. Falar com o Financeiro.\n' +
    '2. Falar com a Secretaria.\n' +
    '3. Falar com Colégio/Pós-Graduação.\n' + // Adicionado 
    '4. Datas Importantes.\n' +
    '5. Requerimentos.\n' +
    '6. Locação de Espaços para Eventos.\n' +
    '7. Para ver o menu novamente.'; // Atualizado o número total de opções

  client.sendMessage(user, welcomeMessage);
}

client.initialize();

const dates = {
  'Data de Matrícula': ['A DEFINIR', 'A DEFINIR'],
  'Data de Rematrícula': ['A DEFINIR', 'A DEFINIR'],
  'Data de Provas': ['A DEFINIR', 'A DEFINIR', 'A DEFINIR'],
  'Data de Vestibular': ['A DEFINIR'],
};

async function showDates(user) {
  const datesText = Object.keys(dates).map((option, index) => {
    const dateList = dates[option].join(', ');
    return `${index + 1}. ${option}: ${dateList}`;
  }).join('\n');

  await client.sendMessage(user, 'Datas Importantes:\n' + datesText);
}

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

async function showEventSpaces(user) {
  const eventSpacesInfo = 'Está interessado em alugar espaços para eventos? Entre em contato conosco pelo e-mail consultor@isulpar.edu.br para verificar a disponibilidade e solicitar a locação. Teremos prazer em fornecer informações detalhadas sobre nossos espaços e serviços para eventos.';

  await client.sendMessage(user, eventSpacesInfo);
}

// Função para verificar a inatividade do usuário
function checkActivity() {
  const currentTime = new Date();
  const inactiveDuration = (currentTime - lastActivityTime) / (1000 * 60);

  if (!trackingDisabled && inactiveDuration >= 10) {
    lastActivityTime.forEach((activityTime, user) => {
      const inactivityMessage = 'Olá! Fique à vontade para me chamar novamente, digite 7 para ver o menu.';
      client.sendMessage(user, inactivityMessage);
      if (!waitingForRating.get(user)) sendRatingPrompt(user);
      waitingForRating.set(user, true);
    });
  }

  setTimeout(checkActivity, 600000); // Verifica a inatividade a cada 10 minutos
}

function sendRatingPrompt(user) {
  const ratingPromptMessage = 'Por favor, avalie o nosso serviço de atendimento. Digite uma pontuação de 1 a 5, onde 1 é ruim e 5 é excelente.';
  client.sendMessage(user, ratingPromptMessage);
}

// Inicie o rastreamento de inatividade
checkActivity();
