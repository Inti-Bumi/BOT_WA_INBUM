const { Client, LocalAuth } = require('./index'); 
const qrcode = require('qrcode-terminal');
const { MessageMedia } = require('./index'); 
const axios = require('axios');
const FormData = require('form-data');


const client = new Client({
    authStrategy: new LocalAuth({ clientId: "grup-bot" }),
    webVersionCache: {
        type: 'remote',
        // Menggunakan CDN unpkg versi stabil untuk mencegah bug 'r: r' dan error githubusercontent
        remotePath: 'https://unpkg.com' 
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ],
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
});

// 1. EVENT: QR Code Generator
client.on('qr', (qr) => {
    console.log('SILAKAN SCAN QR CODE INI DENGAN WHATSAPP ANDA:');
    qrcode.generate(qr, { small: true });
});

// 2. EVENT: Bot Siap / Online
client.on('ready', () => {
    const botJid = client.info.wid._serialized;
    console.log('============================================');
    console.log('Bot WhatsApp Grup Sukses Terhubung dan Online!');
    console.log('ID Nomor Bot Anda: ' + botJid);
    console.log('============================================');
});

// 3. EVENT: Menangani Pesan Masuk (Hanya ada SATU fungsi utama yang menampung semua IF)
// 3. EVENT: Menangani Pesan Masuk (Hanya ada SATU fungsi utama)
client.on('message', async (msg) => {
    try {
        if (!msg.from.endsWith('@g.us')) return;

        const pesan = msg.body ? msg.body.trim() : '';

        // ========================================================
        // FITUR 1: !ping (Cek Status Bot)
        // ========================================================
        if (pesan === '!ping') {
            await msg.reply('Pong! Bot grup aktif dan merespons.');
            console.log('[LOG] Berhasil merespons !ping');
        } 

        // ========================================================
        // FITUR 2: !myid (Cek ID Grup & Member)
        // ========================================================
        else if (pesan === '!myid') {
            const groupJid = msg.from; 
            const botJid = client.info.wid._serialized;
            const userJid = msg.author || msg.from; 

            const balasan = '*📊 WHATSAPP ID CHECKER*\n\n' +
                            '• *ID Kamu (User JID):* `' + userJid + '`\n' +
                            '• *ID Grup Ini (Group JID):* `' + groupJid + '`\n' +
                            '• *ID Bot Anda:* `' + botJid + '`';

            await msg.reply(balasan);
            console.log('[LOG] ID Terdeteksi -> User: ' + userJid + ' | Group: ' + groupJid);
        }

        // ========================================================
        // FITUR 3: !jodoh (Iseng Ramal Jodoh Antar Member Grup)
        // ========================================================
        else if (pesan === '!jodoh') {
            const chat = await msg.getChat();
            const member = chat.participants;
            if (member.length < 2) return msg.reply('Anggota grup kurang banyak buat dijodohin!');

            // Ambil 2 orang secara acak
            const target1 = member[Math.floor(Math.random() * member.length)];
            let target2 = member[Math.floor(Math.random() * member.length)];

            // Pastikan tidak menjodohkan orang yang sama
            while (target1.id._serialized === target2.id._serialized) {
                target2 = member[Math.floor(Math.random() * member.length)];
            }

            const contact1 = await client.getContactById(target1.id._serialized);
            const contact2 = await client.getContactById(target2.id._serialized);

            const teksJodoh = '🔮 *RAMALAN PERJODOHAN HARI INI* 🔮\n\n' +
                              'Selamat! Hasil penerawangan bot menyatakan:\n' +
                              '@' + target1.id.user + ' 💞 @' + target2.id.user + '\n\n' +
                              'Cocok sebesar *' + Math.floor(Math.random() * 100) + '%*! Buruan PC!';

            await chat.sendMessage(teksJodoh, { mentions: [contact1, contact2] });
            console.log('[LOG] Berhasil menjalankan !jodoh');
        }

        // ========================================================
        // FITUR 4: !gacha (Bikin Keputusan Acak / Taruhan Iseng)
        // ========================================================
        else if (pesan.startsWith('!gacha ')) {
            const pilihan = pesan.replace('!gacha ', '').split('|').map(p => p.trim());
            if (pilihan.length < 2) {
                return msg.reply('💡 Format salah! Contoh:\n*!gacha mabar ML | tidur | nongkrong*');
            }
            
            const hasilAcak = pilihan[Math.floor(Math.random() * pilihan.length)];
            await msg.reply('🎲 *HASIL KEPUTUSAN GACHA BOT:* \n\n👉 *' + hasilAcak + '*');
            console.log('[LOG] Berhasil menjalankan !gacha');
        }

    } catch (err) {
        console.error('[LOG ERROR] Ada kendala membaca pesan:', err.message);
    }
});


// 4. PENGAWAL GLOBAL: Mencegah script mati mendadak
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception caught: ', err);
});

client.initialize();
