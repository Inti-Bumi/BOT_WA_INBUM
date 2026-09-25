const axios = require('axios');

function cleanXmlText(str) {
    if (!str) return '';
    return str
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

module.exports = {
    name: 'trending',
    aliases: ['berita', 'hot', 'viral'],
    description: 'Menampilkan topik dan berita paling panas/viral di Indonesia dari sumber resmi',
    usage: '!trending [topik_spesifik]',
    example: '!trending teknologi',
    async execute({ msg, rawArgs }) {
        const query = rawArgs.trim();

        if (query) {
            await msg.reply(`🔍 Mencari berita dan doksli resmi seputar "${query}" di internet...`);
        } else {
            await msg.reply('🔥 Mengambil isu & topik terhangat di Indonesia saat ini...');
        }

        try {
            const url = query
                ? `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`
                : `https://news.google.com/rss?hl=id&gl=ID&ceid=ID:id`;

            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const xml = res.data;
            const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>([\s\S]*?<source[^>]*>(.*?)<\/source>)?[\s\S]*?<\/item>/g;
            const matches = [...xml.matchAll(itemRegex)];

            if (matches.length === 0) {
                await msg.reply(`❌ Tidak ditemukan berita resmi terkait "${query}".`);
                return;
            }

            const limit = Math.min(matches.length, 5);
            const headerTitle = query 
                ? `🔥 *BERITA & DOKSLI RESMI: ${query.toUpperCase()}*`
                : `🔥 *TOPIK & ISU TERPANAS HARI INI*`;

            let hasil = `${headerTitle}\n\n`;

            for (let i = 0; i < limit; i++) {
                const title = cleanXmlText(matches[i][1]);
                const link = cleanXmlText(matches[i][2]);
                const pubDateRaw = cleanXmlText(matches[i][3]);
                const source = cleanXmlText(matches[i][5]) || 'Media Resmi';

                let waktu = '';
                try {
                    waktu = new Date(pubDateRaw).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                } catch {
                    waktu = pubDateRaw;
                }

                hasil += `${i + 1}. *${title}*\n`;
                hasil += `   📰 *Sumber:* ${source} (${waktu})\n`;
                hasil += `   🔗 *Baca:* ${link}\n\n`;
            }

            hasil += `_💡 Sumber resmi terverifikasi dari portal berita nasional._`;
            await msg.reply(hasil);
            console.log(`[LOG] Berhasil memuat berita: ${query || 'Headlines'}`);
        } catch (err) {
            await msg.reply(`⚠️ Gagal mengambil berita: ${err.message}`);
            console.error('[LOG ERROR] Berita error:', err.message);
        }
    }
};
