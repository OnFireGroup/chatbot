const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client({});

let lastActivityTime = new Date();

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

function checkActivity() {
    const currentTime = new Date();
    const inactiveDuration = (currentTime - lastActivityTime) / (1000 * 60);

    if (inactiveDuration >= 15) {
        const inactivityMessage = 'Olá! Parece que você está inativo há um tempo. Se precisar de ajuda, por favor, digite alguma mensagem para continuar.';
        client.sendText(user, inactivityMessage);
    }

    setTimeout(checkActivity, 60000);
}

async function handleMessage(message) {
    if (!message.isGroupMsg) {
        const response = 'Olá! Sou a Rosi, sua assistente virtual. Como posso ajudar?\n' +
                         '1. Falar com o Financeiro.\n' +
                         '2. Falar com a Secretaria.\n' +
                         '3. Datas Importantes.\n' +
                         '4. Requerimentos.\n' +
                         '5. Locação de Espaços para Eventos.\n' +
                         '6. Outras opções.';

        await client.sendText(message.from, response);

        const userOption = parseInt(message.body);
        switch (userOption) {
            case 5:
                await showEventSpaces(message.from);
                break;
            default:
                break;
        }
    }
}

client.initialize();

const dates = {
    'Data de Matrícula': ['01/08/2023', '15/08/2023'],
    'Data de Rematrícula': ['10/08/2023', '25/08/2023'],
    'Data de Provas': ['20/09/2023', '15/10/2023', '10/11/2023'],
    'Data de Vestibular': ['05/09/2023'],
};

async function showDates(user) {
    const datesText = Object.keys(dates).map((option, index) => `${index + 1}. ${option}`).join('\n');
    const question = 'Escolha uma opção de datas:\n' + datesText;

    await client.sendText(user, question);
}

async function sendRequirementsInstructions(user) {
    const instructions = 'Para fazer requerimentos, siga as instruções abaixo:\n' +
                         '1. Acesse o portal do aluno: https://isulpar.jacad.com.br/academico/aluno-v2/login\n' +
                         '2. Coloque seu CPF no login e a senha é sua data de nascimento (ex: 01011991 sem / ou -)\n' +
                         '3. Clique em "Secretaria" e em seguida em "Requerimentos"\n' +
                         '4. Clique no botão roxo escrito "+ Solicitar Requerimento"\n' +
                         '5. Selecione sua matrícula e o tipo de requerimento\n' +
                         '6. Em caso de alteração de data de vencimento, a nova data deve ser informada na observação.';
    
    await client.sendText(user, instructions);
}

async function showOtherOptions(user) {
}

async function showEventSpaces(user) {
    const eventSpacesInfo = 'Está interessado em alugar espaços para eventos? Entre em contato conosco pelo e-mail exemplo@email.com para verificar a disponibilidade e solicitar a locação. Teremos prazer em fornecer informações detalhadas sobre nossos espaços e serviços para eventos.';
    
    await client.sendText(user, eventSpacesInfo);
}

checkActivity();
