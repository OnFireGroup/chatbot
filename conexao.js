const qrcode = require('qrcode-terminal');

const { Client, NoAuth } = require('whatsapp-web.js');
// equivalent to
const client = new Client({
    authStrategy: new NoAuth()
});


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
 