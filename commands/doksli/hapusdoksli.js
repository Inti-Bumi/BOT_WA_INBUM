const doksliService = require('../../services/doksliService');

module.exports = {
    name: 'hapusdoksli',
    aliases: ['deldoksli', 'deletedoksli'],
    description: 'Menghapus arsip doksli tertentu dari database grup',
    usage: '!hapusdoksli <nama_kunci>',
    example: '!hapusdoksli budi_tidur',
    async execute({ msg, rawArgs, groupJid }) {
        const key = rawArgs.trim().toLowerCase();
        if (!key) {
            await msg.reply('Tentukan nama doksli yang ingin dihapus.\nContoh: *!hapusdoksli budi_tidur*');
            return;
        }

        const success = doksliService.deleteDoksli(groupJid, key);
        if (!success) {
            await msg.reply(`Doksli *${key}* tidak ditemukan.`);
            return;
        }

        await msg.reply(`🗑️ Doksli *${key}* berhasil dihapus.`);
        console.log(`[LOG] Doksli dihapus: ${key}`);
    }
};
