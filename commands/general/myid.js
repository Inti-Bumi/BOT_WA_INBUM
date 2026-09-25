module.exports = {
    name: 'myid',
    aliases: ['id', 'cekid'],
    description: 'Menampilkan User JID pengirim, Group JID, dan JID Bot',
    usage: '!myid',
    example: '!myid',
    async execute({ client, msg, groupJid, userJid }) {
        const botJid = client.info.wid._serialized;
        const balasan = '*📊 WHATSAPP ID CHECKER*\n\n' +
                        '• *ID Kamu (User JID):* `' + userJid + '`\n' +
                        '• *ID Grup Ini (Group JID):* `' + groupJid + '`\n' +
                        '• *ID Bot Anda:* `' + botJid + '`';

        await msg.reply(balasan);
        console.log('[LOG] ID Terdeteksi -> User: ' + userJid + ' | Group: ' + groupJid);
    }
};
