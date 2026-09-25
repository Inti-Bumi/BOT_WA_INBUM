const fs = require('fs');
const path = require('path');

const commands = new Map();
const aliases = new Map();

function loadCommands(dir = path.join(__dirname, '..', 'commands')) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command.name && typeof command.execute === 'function') {
                    commands.set(command.name.toLowerCase(), command);

                    if (Array.isArray(command.aliases)) {
                        for (const alias of command.aliases) {
                            aliases.set(alias.toLowerCase(), command.name.toLowerCase());
                        }
                    }
                    console.log(`[COMMAND LOADED] ${command.name}`);
                }
            } catch (err) {
                console.error(`[COMMAND ERROR] Gagal memuat file ${file}:`, err.message);
            }
        }
    }
}

// Initial load
loadCommands();

async function handleMessage(client, msg) {
    try {
        if (!msg.from.endsWith('@g.us')) return;

        const body = msg.body ? msg.body.trim() : '';
        if (!body.startsWith('!')) return;

        const groupJid = msg.from;
        const userJid = msg.author || msg.from;

        console.log(`[PESAN DITERIMA] Di grup ${groupJid} dari ${userJid}: "${body}"`);

        const parts = body.slice(1).trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        const rawArgs = body.slice(1 + commandName.length).trim();

        const actualCommandName = commands.has(commandName) 
            ? commandName 
            : aliases.get(commandName);

        if (!actualCommandName) return;

        const command = commands.get(actualCommandName);
        if (command) {
            await command.execute({
                client,
                msg,
                args,
                rawArgs,
                groupJid,
                userJid,
                commands,
                aliases
            });
        }
    } catch (err) {
        console.error('[HANDLER ERROR] Terjadi kesalahan saat memproses pesan:', err.message);
    }
}

module.exports = {
    handleMessage,
    loadCommands
};
