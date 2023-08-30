const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client({});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Conectado com SUCESSO!!');
});

client.on('message', async (message) => {
    if (!message.isGroup) {
        const response = 'Olá! Sou a Rosi, sua assistente virtual. Como posso ajudar?\n' +
                         '1. Falar com o Financeiro.\n' +
                         '2. Falar com a Secretaria.\n' +
                         '3. Locação de Espaços.\n' +
                         '4. Datas Importantes.\n' +
                         '5. Outras opções.';

        await client.sendText(message.from, response);
    }
});

client.on('message', async (message) => {
    if (!message.isGroup) {
        const userOption = parseInt(message.body);

        switch (userOption) {
            case 1:
                await client.sendText(message.from, 'Você escolheu falar com o Financeiro.');
                break;
            case 2:
                await client.sendText(message.from, 'Você escolheu falar com a Secretaria.');
                break;
            case 3:
                await client.sendText(message.from, 'Você escolheu Locação de Espaços.\nPor favor, forneça mais informações para que possamos ajudar.');
                break;
            case 4:
                await showDates(message.from);
                break;
            case 5:
                await showOtherOptions(message.from);
                break;
            default:
                await client.sendText(message.from, 'Opção inválida. Por favor, escolha uma das opções listadas anteriormente.');
                break;
        }
    }
});

async function showDates(user) {
    const datesText = Object.keys(dates).map((option, index) => `${index + 1}. ${option}`).join('\n');
    const question = 'Escolha uma opção de datas:\n' + datesText;

    await client.sendText(user, question);
}

client.initialize();

const dates = {
    'Data de Matrícula': ['01/08/2023', '15/08/2023'],
    'Data de Rematrícula': ['10/08/2023', '25/08/2023'],
    'Data de Provas': ['20/09/2023', '15/10/2023', '10/11/2023'],
    'Data de Vestibular': ['05/09/2023'],
    'Data de Locação de Espaços': ['01/09/2023', '10/09/2023'],
};

async function showOtherOptions(user) {
}