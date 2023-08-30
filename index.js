const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Conectado com SUCESSO!!');
});

client.on('authenticated', () => {
    console.log('Autenticado com SUCESSO!!');
});

client.initialize();
