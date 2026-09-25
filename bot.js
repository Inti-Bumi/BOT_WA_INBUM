require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const clientConfig = require('./config/clientConfig');
const { handleMessage } = require('./handlers/messageHandler');

const client = new Client(clientConfig);

client.on('loading_screen', (percent, message) => {
    console.log(`[LOADING] ${percent}% - ${message}`);
});

client.on('qr', (qr) => {
    console.log('SILAKAN SCAN QR CODE INI DENGAN WHATSAPP ANDA:');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('[AUTH] Autentikasi berhasil!');
});

client.on('auth_failure', (msg) => {
    console.error('[AUTH ERROR] Gagal autentikasi:', msg);
});

client.on('disconnected', (reason) => {
    console.log('[DISCONNECTED] Bot terputus:', reason);
});

client.on('ready', () => {
    const botJid = client.info.wid._serialized;
    console.log('============================================');
    console.log('Bot WhatsApp Grup Sukses Terhubung dan Online!');
    console.log('ID Nomor Bot Anda: ' + botJid);
    console.log('============================================');
});

client.on('message_create', async (msg) => {
    await handleMessage(client, msg);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception caught: ', err);
});

client.initialize();
