const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'meme',
    aliases: ['memes'],
    description: 'Mengambil meme acak dari internet',
    usage: '!meme',
    example: '!meme',
    async execute({ client, msg, groupJid }) {
        await msg.reply('⏳ Mengambil meme acak dari internet...');
        try {
            const res = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });
            const { url: memeUrl, title: memeTitle, subreddit, postLink } = res.data;

            // 1. Coba kirim via media file langsung
            try {
                const media = await MessageMedia.fromUrl(memeUrl);
                await client.sendMessage(groupJid, media, { caption: `🎭 *${memeTitle}*\n📌 Source: r/${subreddit}` });
                console.log(`[LOG] Berhasil mengirim file meme: ${memeTitle}`);
                return;
            } catch (mediaErr) {
                console.warn('[LOG] Media upload bypass, fallback ke link preview:', mediaErr.message);
            }

            // 2. Fallback link preview teks interaktif
            const teksMeme = 
`🎭 *MEME OF THE DAY*

📌 *Judul:* ${memeTitle}
🌐 *Komunitas:* r/${subreddit}
🖼️ *Lihat Gambar:* ${memeUrl}
🔗 *Post Asli:* ${postLink || memeUrl}`;

            await msg.reply(teksMeme);
            console.log(`[LOG] Berhasil mengirim teks preview meme: ${memeTitle}`);
        } catch (err) {
            await msg.reply(`⚠️ Gagal mengambil meme: ${err.message}`);
            console.error('[LOG ERROR] Meme error:', err.message);
        }
    }
};
