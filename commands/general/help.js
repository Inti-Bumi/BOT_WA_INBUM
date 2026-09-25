module.exports = {
    name: 'help',
    aliases: ['panduan', 'bantuan', 'menu'],
    description: 'Menampilkan panduan lengkap penggunaan bot dan detail setiap command',
    usage: '!help [nama_command]',
    example: '!help doksli',
    async execute({ msg, rawArgs, commands, aliases }) {
        const query = rawArgs.trim().toLowerCase();

        // 1. Jika meminta bantuan spesifik per command
        if (query) {
            const actualName = commands.has(query) ? query : aliases.get(query);
            const cmd = commands.get(actualName);

            if (!cmd) {
                await msg.reply(`❌ Command *!${query}* tidak ditemukan.\nKetik *!help* untuk melihat seluruh daftar command.`);
                return;
            }

            const aliasText = cmd.aliases && cmd.aliases.length > 0 ? cmd.aliases.map(a => `!${a}`).join(', ') : '-';
            const usageText = cmd.usage ? `\`${cmd.usage}\`` : `\`!${cmd.name}\``;
            const exampleText = cmd.example ? `\`${cmd.example}\`` : `\`!${cmd.name}\``;

            const detailTeks = 
`*📖 PANDUAN COMMAND: !${cmd.name.toUpperCase()}*

• *Deskripsi:* ${cmd.description || 'Tidak ada deskripsi.'}
• *Format Penggunaan:* ${usageText}
• *Contoh:* ${exampleText}
• *Alias:* ${aliasText}`;

            await msg.reply(detailTeks);
            return;
        }

        // 2. Panduan Utama Lengkap
        const panduanUtama = 
`*📖 PANDUAN PENGGUNAAN BOT WHATSAPP*

Bot ini dirancang untuk grup pertemanan dengan fitur arsip doksli internal, investigasi isu viral/berita resmi internet, dan utility tongkrongan. Gunakan prefix tanda seru (\`!\`).

---
*📌 1. UTILITY & INFORMASI*
• *!help* / *!menu* : Menampilkan panduan ini
• *!help <command>* : Detail cara pakai (contoh: \`!help doksli\`)
• *!ping* : Cek status online & responsivitas bot
• *!myid* : Cek ID WhatsApp kamu & ID grup
• *!gacha <a | b | c>* : Memilih opsi acak dari pilihan yang dipisah \`|\`

*📁 2. DOKSLI ARSIP GRUP (INTERNAL)*
_Menyimpan foto aib, screenshot chat, atau quote internal tongkrongan._
• *!tambahdoksli <nama>* : 
  👉 *Cara:* Reply foto / video / teks teman, lalu ketik \`!tambahdoksli nama_kunci\`
• *!doksli <nama>* : 
  👉 Memanggil & menampilkan kembali bukti foto/teks yang pernah disimpan
• *!listdoksli* : 
  👉 Melihat seluruh daftar nama doksli yang tersimpan di grup ini
• *!hapusdoksli <nama>* : 
  👉 Menghapus arsip doksli dari database grup

*🌐 3. DOKSLI ISU INTERNET & INFORMASI*
• *!doksli <topik_internet>* : 
  👉 Investigasi doksli & rangkuman berita terverifikasi dari portal resmi
• *!trending* / *!berita* : 
  👉 Menampilkan topik & isu terpanas hari ini di Indonesia
• *!wiki <topik>* : 
  👉 Mencari artikel ensiklopedia di Wikipedia Indonesia
• *!meme* : 
  👉 Mengambil meme acak terbaru dari internet

---
💡 *Tips:* Ketik \`!help <nama_command>\` untuk melihat contoh detail perintah tertentu.`;

        await msg.reply(panduanUtama);
    }
};
