const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client({});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Conectado com SUCESSO!!');
});

const assistantOptions = [
    'Data de Matrícula',
    'Data de Rematrícula',
    'Data de Provas',
    'Data de Vestibular',
    'Eventos',
];

const dates = {
    'Data de Matrícula': ['01/08/2023', '15/08/2023'],
    'Data de Rematrícula': ['10/08/2023', '25/08/2023'],
    'Data de Provas': ['20/09/2023', '15/10/2023', '10/11/2023'],
    'Data de Vestibular': ['05/09/2023'],
};

client.on('message', async (message) => {
    if (!message.isGroup) {
        if (message.body.toLowerCase().includes('oi') || message.body.toLowerCase().includes('olá')) {
            const response = 'Olá! Sou a Rosi, sua assistente virtual. Como posso ajudar?\n' +
                             'Digite "1" para ver as opções disponíveis.';
            await client.sendText(message.from, response);
        } else if (message.body === '1') {
            await showAssistantOptions(message.from);
        }
    }
});

async function showAssistantOptions(user) {
    const optionsText = assistantOptions.map((option, index) => `${index + 1}. ${option}`).join('\n');
    const question = 'Escolha uma opção:\n' + optionsText;

    await client.sendText(user, question);
}

client.on('message', async (message) => {
    const chosenOptionIndex = parseInt(message.body) - 1;
    if (chosenOptionIndex >= 0 && chosenOptionIndex < assistantOptions.length) {
        const chosenOption = assistantOptions[chosenOptionIndex];
        
        if (dates[chosenOption]) {
            const datesList = dates[chosenOption].join('\n');
            await client.sendText(message.from, `Você escolheu "${chosenOption}".\nAs datas são:\n${datesList}`);
        } else {
            await client.sendText(message.from, `Você escolheu "${chosenOption}". Aguarde enquanto processamos a sua solicitação.`);
        }
        
        // Aqui é onde você implementaria a lógica adicional para responder à opção escolhida.
    }
});

client.initialize();
