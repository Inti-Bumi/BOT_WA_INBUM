const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

const WIKI_HEADERS = {
    'User-Agent': 'WhatsAppBotGroup/1.0 (https://github.com/wwebjs/whatsapp-web.js; bot@local.net)'
};

module.exports = {
    name: 'wiki',
    aliases: ['wikipedia'],
    description: 'Mencari artikel dan ringkasan fakta di Wikipedia Indonesia',
    usage: '!wiki <topik>',
    example: '!wiki Albert Einstein',
    async execute({ client, msg, rawArgs, groupJid }) {
        const query = rawArgs.trim();
        if (!query) {
            await msg.reply('Format salah.\nContoh: *!wiki Albert Einstein*');
            return;
        }

        await msg.reply(`🔍 Mencari data "${query}" di Wikipedia...`);

        try {
            let targetTitle = query;

            // 1. Coba cari judul artikel yang paling cocok via OpenSearch jika pencarian berupa kata kunci
            try {
                const searchRes = await axios.get(
                    `https://id.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`,
                    { headers: WIKI_HEADERS, timeout: 8000 }
                );
                if (searchRes.data && searchRes.data[1] && searchRes.data[1].length > 0) {
                    targetTitle = searchRes.data[1][0];
                }
            } catch {}

            // 2. Ambil ringkasan REST API Wikipedia
            const res = await axios.get(
                `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(targetTitle)}`,
                { headers: WIKI_HEADERS, timeout: 10000 }
            );
            const data = res.data;

            if (data.type === 'disambiguation') {
                await msg.reply(`Topik "${targetTitle}" memiliki banyak kemungkinan arti. Coba kata kunci yang lebih spesifik.`);
                return;
            }

            const title = data.title || targetTitle;
            const extract = data.extract || 'Tidak ada ringkasan teks.';
            const pageUrl = data.content_urls?.desktop?.page || `https://id.wikipedia.org/wiki/${encodeURIComponent(targetTitle)}`;

            if (data.thumbnail && data.thumbnail.source) {
                try {
                    const media = await MessageMedia.fromUrl(data.thumbnail.source);
                    await client.sendMessage(groupJid, media, { caption: `📖 *${title}*\n\n${extract}\n\n🔗 ${pageUrl}` });
                    return;
                } catch (e) {
                    console.error('[LOG] Gagal load thumbnail wiki:', e.message);
                }
            }

            await msg.reply(`📖 *${title}*\n\n${extract}\n\n🔗 ${pageUrl}`);
            console.log(`[LOG] Berhasil memuat wiki: ${title}`);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                await msg.reply(`❌ Topik "${query}" tidak ditemukan di Wikipedia.`);
            } else {
                await msg.reply(`⚠️ Gagal mengambil data Wikipedia: ${err.message}`);
            }
        }
    }
};
