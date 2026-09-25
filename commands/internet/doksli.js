const { searchDoksliMultiSource } = require('../../services/searchService');

module.exports = {
    name: 'doksli',
    aliases: ['fakta', 'isu', 'stalk', 'jejak'],
    description: 'Investigasi digital & cari postingan asli di X/Twitter, TikTok, Instagram, Facebook, Reddit',
    usage: '!doksli <nama/topik_viral>',
    example: '!doksli mas rusdi',
    async execute({ msg, rawArgs }) {
        const query = rawArgs.trim();
        if (!query) {
            await msg.reply('Tentukan topik atau nama yang ingin dicari postingan doksli-nya.\n\nContoh:\n• *!doksli mas rusdi*\n• *!doksli kasus viral hari ini*');
            return;
        }

        await msg.reply(`🔍 Mengumpulkan doksli & rekam jejak medsos "${query}"...`);

        try {
            const searchData = await searchDoksliMultiSource(query);
            const results = searchData.results || [];

            if (results.length === 0) {
                await msg.reply(`❌ Tidak ditemukan postingan doksli terkait "${query}".`);
                return;
            }

            let hasil = `📁 *INVESTIGASI DOKSLI: ${query.toUpperCase()}*\n`;
            hasil += `_Mesin: ${searchData.engine}_\n\n`;

            if (searchData.summary) {
                hasil += `📝 *RINGKASAN KONTEKS & FAKTA:*\n`;
                hasil += `${searchData.summary}\n\n`;
            }

            hasil += `🌐 *POSTINGAN ASLI & JEJAK DIGITAL DITEMUKAN:*\n\n`;

            results.forEach((r, idx) => {
                hasil += `*${idx + 1}. ${r.title}*\n`;
                hasil += `   📌 *Platform:* ${r.source}\n`;
                if (r.snippet) {
                    hasil += `   💬 *Kutipan:* "${r.snippet.slice(0, 130)}..."\n`;
                }
                hasil += `   🔗 *Buka Link Postingan:* ${r.link}\n\n`;
            });

            const encodedQ = encodeURIComponent(query);
            hasil += `📱 *PENCARIAN LANGSUNG PLATFORM:*\n`;
            hasil += `• 🐦 *X (Twitter Live):* https://x.com/search?q=${encodedQ}&f=live\n`;
            hasil += `• 🎵 *TikTok Feed:* https://www.tiktok.com/search?q=${encodedQ}\n\n`;
            hasil += `_💡 Klik link di atas untuk membuka langsung postingan asli di aplikasi masing-masing._`;

            await msg.reply(hasil);
            console.log(`[LOG] Berhasil memuat doksli: ${query}`);
        } catch (err) {
            await msg.reply(`⚠️ Gagal mencari doksli: ${err.message}`);
            console.error('[LOG ERROR] Doksli error:', err.message);
        }
    }
};
