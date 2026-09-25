const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');
const doksliService = require('../../services/doksliService');
const { searchDoksliMultiSource } = require('../../services/searchService');

module.exports = {
    name: 'doksli',
    aliases: ['getdoksli', 'ambildoksli', 'fakta', 'isu', 'stalk'],
    description: 'Investigasi doksli lengkap: Arsip Grup, Direct Postingan Medsos Asli, dan Laporan Resmi',
    usage: '!doksli <topik_atau_nama_arsip>',
    example: '!doksli mas rusdi',
    async execute({ client, msg, rawArgs, groupJid }) {
        const query = rawArgs.trim();
        if (!query) {
            await msg.reply('Tentukan topik doksli yang ingin dicari.\n\nContoh:\n• *!doksli budi_tidur* (arsip internal grup)\n• *!doksli mas rusdi* (investigasi medsos & web)\n\nKetik *!listdoksli* untuk daftar arsip grup.');
            return;
        }

        const key = query.toLowerCase();

        // 1. Cek apakah ada di arsip internal grup terlebih dahulu
        const item = doksliService.getDoksli(groupJid, key);

        if (item) {
            if (item.type === 'media') {
                if (fs.existsSync(item.filePath)) {
                    try {
                        const media = MessageMedia.fromFilePath(item.filePath);
                        const caption = `📁 *DOKSLI ARSIP GRUP:* ${key}\n👤 Disimpan oleh: ${item.savedBy.split('@')[0]}`;
                        await client.sendMessage(groupJid, media, { caption });
                        console.log(`[LOG] Mengirim doksli media internal: ${key}`);
                        return;
                    } catch (e) {
                        console.warn('[LOG] Gagal kirim media internal:', e.message);
                    }
                }
            } else if (item.type === 'text') {
                const balasan = `📁 *DOKSLI ARSIP GRUP (TEKS):* ${key}\n\n"${item.content}"\n\n_👤 Disimpan oleh: ${item.savedBy.split('@')[0]}_`;
                await msg.reply(balasan);
                console.log(`[LOG] Mengirim doksli teks internal: ${key}`);
                return;
            }
        }

        // 2. Jika tidak ada di internal grup, jalankan investigasi multi-sumber
        await msg.reply(`🔍 Mengumpulkan doksli & rekam jejak digital "${query}"...`);

        try {
            const searchData = await searchDoksliMultiSource(query);
            const results = searchData.results || [];

            if (results.length === 0) {
                await msg.reply(`❌ Tidak ditemukan rekam jejak doksli terkait "${query}".`);
                return;
            }

            let hasil = `📁 *INVESTIGASI DOKSLI: ${query.toUpperCase()}*\n`;
            hasil += `_Mesin: ${searchData.engine}_\n\n`;

            if (searchData.summary) {
                hasil += `📝 *RINGKASAN KONTEKS & FAKTA:*\n`;
                hasil += `${searchData.summary}\n\n`;
            }

            hasil += `🌐 *POSTINGAN & SUMBER DIGITAL DITEMUKAN:*\n\n`;

            results.forEach((r, idx) => {
                hasil += `*${idx + 1}. ${r.title}*\n`;
                hasil += `   📌 *Platform:* ${r.source}\n`;
                if (r.snippet) {
                    hasil += `   💬 *Kutipan:* "${r.snippet.slice(0, 130)}..."\n`;
                }
                hasil += `   🔗 *Buka Link Asli:* ${r.link}\n\n`;
            });

            const encodedQ = encodeURIComponent(query);
            hasil += `📱 *AKSES LANGSUNG MEDSOS:*\n`;
            hasil += `• 🐦 *X (Twitter Live):* https://x.com/search?q=${encodedQ}&f=live\n`;
            hasil += `• 🎵 *TikTok Feed:* https://www.tiktok.com/search?q=${encodedQ}\n\n`;
            hasil += `_💡 Klik link di atas untuk membuka postingan asli Instagram, Facebook, X, atau berita terkait._`;

            await msg.reply(hasil);
            console.log(`[LOG] Berhasil memuat doksli: ${query}`);
        } catch (err) {
            await msg.reply(`⚠️ Gagal mencari doksli: ${err.message}`);
            console.error('[LOG ERROR] Doksli error:', err.message);
        }
    }
};
