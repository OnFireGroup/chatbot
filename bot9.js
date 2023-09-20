const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client({});

client.on('qr', qr => qrcode.generate(qr, { small: true }));

client.on('ready', () => console.log('Conectado com SUCESSO!!'));

client.on('message', handleMessage);

let lastActivityTime = new Date();
let trackingDisabled = false;

async function handleMessage(message) {
    if (!message.isGroupMsg) {
        const user = message.from;
        const userOption = parseInt(message.body);

        lastActivityTime = new Date(); // Atualiza o tempo da última atividade

        switch (userOption) {
            case 1:
            case 2:
                trackingDisabled = true; // Desabilita o rastreamento
                await client.sendMessage(user, `Você escolheu falar com o ${userOption === 1 ? 'Financeiro' : 'Secretaria'}. Aguarde um momento.`);
                setTimeout(() => { trackingDisabled = false; }, 900000); // Reabilita o rastreamento após 15 minutos
                break;
            case 6:
                sendWelcomeMessage(user); // Utiliza "Bem-vindo de volta" para mensagens subsequentes
                break;
            default:
                sendMainMenu(user);
                break;
        }
    }
}

function sendMainMenu(user) {
    const menuMessage = 'Bem-vindo sou a Rosi e estou em versão de testes! Como posso ajudar?\n' +
        '1. Falar com o Financeiro.\n' +
        '2. Falar com a Secretaria.\n' +
        '6. Digite "menu" para ver o menu novamente.';
    client.sendMessage(user, menuMessage);
}

function sendWelcomeMessage(user) {
    const welcomeMessage = 'Aqui estão as opções\n' +
        '1. Falar com o Financeiro.\n' +
        '2. Falar com a Secretaria.\n' +
        '6. Para ver o menu novamente.';
    client.sendMessage(user, welcomeMessage);
}

client.initialize();

// Função para verificar a inatividade do usuário
function checkActivity() {
    const currentTime = new Date();
    const inactiveDuration = (currentTime - lastActivityTime) / (1000 * 60);

    if (!trackingDisabled && inactiveDuration >= 10) {
        const inactivityMessage = 'Olá! Fique à vontade para me chamar novamente, digite 6 para ver o menu.';
        client.sendMessage(user, inactivityMessage);
    }

    setTimeout(checkActivity, 600000); // Verifica a inatividade a cada 10 minutos
}

checkActivity();