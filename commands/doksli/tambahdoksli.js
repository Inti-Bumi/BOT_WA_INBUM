const doksliService = require('../../services/doksliService');

module.exports = {
    name: 'tambahdoksli',
    aliases: ['simpandoksli'],
    description: 'Menyimpan media (foto/video) atau teks sebagai arsip doksli grup',
    usage: '!tambahdoksli <nama_kunci> (dengan mereply foto/teks)',
    example: '!tambahdoksli budi_tidur',
    async execute({ msg, rawArgs, groupJid, userJid }) {
        const key = rawArgs.trim().toLowerCase();
        if (!key) {
            await msg.reply('Tentukan nama kunci doksli!\nContoh: Reply foto lalu ketik *!tambahdoksli budi_tidur*');
            return;
        }

        let targetMsg = msg;
        if (msg.hasQuotedMsg) {
            targetMsg = await msg.getQuotedMessage();
        }

        if (targetMsg.hasMedia) {
            await msg.reply('⏳ Mengunduh dan menyimpan media doksli...');
            const media = await targetMsg.downloadMedia();
            if (!media || !media.data) {
                await msg.reply('Gagal mengunduh media. Coba kirim ulang gambarnya.');
                return;
            }

            doksliService.saveMediaDoksli(groupJid, key, media, userJid);
            await msg.reply(`✅ Doksli media *${key}* berhasil disimpan!\nPanggil kapan saja dengan mengetik: *!doksli ${key}*`);
            console.log(`[LOG] Doksli media tersimpan: ${key}`);
        } else if (targetMsg !== msg && targetMsg.body) {
            doksliService.saveTextDoksli(groupJid, key, targetMsg.body, userJid);
            await msg.reply(`✅ Doksli kutipan teks *${key}* berhasil disimpan!\nPanggil kapan saja dengan mengetik: *!doksli ${key}*`);
            console.log(`[LOG] Doksli teks tersimpan: ${key}`);
        } else {
            await msg.reply('⚠️ Harap reply (balas) foto, video, atau teks pesan yang ingin dijadikan doksli.');
        }
    }
};
