module.exports = {
    name: 'ping',
    aliases: ['p'],
    description: 'Mengecek apakah bot dalam keadaan online dan responsif',
    usage: '!ping',
    example: '!ping',
    async execute({ msg }) {
        await msg.reply('Pong! Bot grup aktif dan merespons.');
        console.log('[LOG] Berhasil merespons !ping');
    }
};
