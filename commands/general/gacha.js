module.exports = {
    name: 'gacha',
    aliases: ['acak', 'pilih', 'random'],
    description: 'Memilih satu opsi secara acak dari beberapa pilihan yang dipisahkan karakter |',
    usage: '!gacha <opsi 1> | <opsi 2> | ...',
    example: '!gacha mabar ML | nonton bioskop | tidur',
    async execute({ msg, rawArgs }) {
        const pilihan = rawArgs.split('|').map(p => p.trim()).filter(p => p.length > 0);

        if (pilihan.length < 2) {
            await msg.reply('Format salah.\n\nContoh penggunaan:\n!gacha mabar ML | tidur | nongkrong');
            return;
        }

        const hasilAcak = pilihan[Math.floor(Math.random() * pilihan.length)];
        await msg.reply('🎲 *HASIL GACHA:*\n\n👉 ' + hasilAcak);
        console.log('[LOG] Berhasil menjalankan !gacha -> Hasil: ' + hasilAcak);
    }
};
