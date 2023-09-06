const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client({});

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('ready', () => console.log('Conectado com SUCESSO!!'));

client.on('message', handleMessage);

let lastActivityTime = new Date();
let waitingForRating = false;
let trackingDisabled = false;
let welcomeMessageSent = {};

async function handleMessage(message) {
    if (!message.isGroupMsg) {
        const user = message.from;
        const userOption = parseInt(message.body);
        const isFirstMessage = !welcomeMessageSent[user];

        if (isFirstMessage) {
            sendWelcomeMessage(user); // Envia uma mensagem de saudação para a primeira mensagem do usuário
            welcomeMessageSent[user] = true;
        } else {
            lastActivityTime = new Date(); // Atualiza o tempo da última atividade
        }

        switch (userOption) {
            case 1:
            case 2:
                trackingDisabled = true; // Desabilita o rastreamento
                await client.sendMessage(user, `Você escolheu falar com o ${userOption === 1 ? 'Financeiro' : 'Secretaria'}. Aguarde um momento.`);
                setTimeout(() => { trackingDisabled = false; }, 900000); // Reabilita o rastreamento após 15 minutos
                break;
            case 3:
                await showDates(user);
                break;
            case 4:
                sendRequirementsInstructions(user);
                break;
            case 5:
                showEventSpaces(user);
                break;
            case 6:
                sendWelcomeMessage(user); // Utiliza "Bem-vindo de volta" para mensagens subsequentes
                break;
        }
    }
}

function sendWelcomeMessage(user) {
    const welcomeMessage = 'Bem-vindo sou a Rosi e estou em versão de testes! Como posso ajudar?\n' +
        '1. Falar com o Financeiro.\n' +
        '2. Falar com a Secretaria.\n' +
        '3. Datas Importantes.\n' +
        '4. Requerimentos.\n' +
        '5. Locação de Espaços para Eventos.\n' +
        '6. Digite "menu" para ver o menu novamente.';
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
function checkActivity(user) {
    const currentTime = new Date();
    const inactiveDuration = (currentTime - lastActivityTime) / (1000 * 60);

    if (!trackingDisabled && inactiveDuration >= 10) {
        const inactivityMessage = 'Olá! Fique à vontade para me chamar novamente, digite 6 para ver o menu.';
        client.sendMessage(user, inactivityMessage);
        if (!waitingForRating) sendRatingPrompt(user);
        waitingForRating = true;
    }

    setTimeout(() => checkActivity(user), 600000); // Verifica a inatividade a cada 10 minutos
}

function sendRatingPrompt(user) {
    const ratingPromptMessage = 'Por favor, avalie o nosso serviço de atendimento. Digite uma pontuação de 1 a 5, onde 1 é ruim e 5 é excelente.';
    client.sendMessage(user, ratingPromptMessage);
}

checkActivity();
