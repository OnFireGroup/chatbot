const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client({});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Conectado com SUCESSO!!');
});

client.on('message', (message) => {
    const keywords = ['oi', 'olá', 'Oi', 'Olá', 'ola', 'Ola'];
    if (keywords.some(keyword => message.body.includes(keyword))) {
        return message.reply('Olá! Sou a Rosi, sua assistente virtual. Como posso ajudar?');
    }
});

client.initialize();