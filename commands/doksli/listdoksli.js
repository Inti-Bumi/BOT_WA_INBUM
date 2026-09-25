const doksliService = require('../../services/doksliService');

module.exports = {
    name: 'listdoksli',
    aliases: ['daftardoksli', 'semuadoksli'],
    description: 'Melihat seluruh daftar nama doksli yang tersimpan di grup ini',
    usage: '!listdoksli',
    example: '!listdoksli',
    async execute({ msg, groupJid }) {
        const groupDoksli = doksliService.listDoksli(groupJid);
        const keys = Object.keys(groupDoksli);

        if (keys.length === 0) {
            await msg.reply('Belum ada doksli yang tersimpan di grup ini.\nSimpan sekarang dengan me-reply media dan ketik *!tambahdoksli <nama>*.');
            return;
        }

        let listTeks = `📁 *DAFTAR DOKSLI GRUP (${keys.length})*\n\n`;
        keys.forEach((k, idx) => {
            const item = groupDoksli[k];
            const icon = item.type === 'media' ? '🖼️' : '💬';
            listTeks += `${idx + 1}. ${icon} *${k}*\n`;
        });
        listTeks += `\nKetik *!doksli <nama>* untuk melihat bukti.`;

        await msg.reply(listTeks);
    }
};
