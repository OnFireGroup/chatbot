const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client({});

let lastActivityTime = new Date();
let waitingForRating = false;
let trackingDisabled = false;
let welcomeMessageSent = {};

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Conectado com SUCESSO!!');
});

client.on('message', (message) => {
    lastActivityTime = new Date();
    handleMessage(message);
});

function checkActivity(user) {
    const currentTime = new Date();
    const inactiveDuration = (currentTime - lastActivityTime) / (1000 * 60);

    if (!trackingDisabled && inactiveDuration >= 10) {
        const inactivityMessage = 'Olá! fique a vontade para me chamar novamente.';
        client.sendMessage(user, inactivityMessage);
        if (!waitingForRating) {
            sendRatingPrompt(user);
            waitingForRating = true;
        }
    }

    setTimeout(() => checkActivity(user), 60000);
}

async function sendRatingPrompt(user) {
    const ratingPrompt = 'Como você avalia a sua experiência com nosso atendimento?\n' +
                        'Responda de 1 a 5 (sendo 1 muito ruim e 5 muito bom).';
    await client.sendMessage(user, ratingPrompt);
}

async function handleMessage(message) {
    if (!message.isGroupMsg) {
        const user = message.from;
        if (!welcomeMessageSent[user]) {
            sendWelcomeMessage(user);
            welcomeMessageSent[user] = true;
        }

        const userOption = parseInt(message.body);
        switch (userOption) {
            case 1:
            case 2:
                trackingDisabled = true;
                await client.sendMessage(user, 'Você escolheu falar com o ' + (userOption === 1 ? 'Financeiro' : 'Secretaria') + '. Aguarde um momento.');
                setTimeout(() => {
                    trackingDisabled = false;
                }, 900000);
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
            default:
                break;
        }

        checkActivity(user);
    }
}

function sendWelcomeMessage(user) {
    const welcomeMessage = 'Bem-vindo de volta! Como posso ajudar agora?\n' +
        '1. Falar com o Financeiro.\n' +
        '2. Falar com a Secretaria.\n' +
        '3. Datas Importantes.\n' +
        '4. Requerimentos.\n' +
        '5. Locação de Espaços para Eventos.';
    client.sendMessage(user, welcomeMessage);
}

client.initialize();

const dates = {
    'Data de Matrícula': ['01/08/2023', '15/08/2023'],
    'Data de Rematrícula': ['10/08/2023', '25/08/2023'],
    'Data de Provas': ['20/09/2023', '15/10/2023', '10/11/2023'],
    'Data de Vestibular': ['05/09/2023'],
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

checkActivity();
