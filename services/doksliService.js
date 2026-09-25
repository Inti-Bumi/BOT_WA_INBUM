const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DOKSLI_DIR = path.join(DATA_DIR, 'doksli');
const DOKSLI_FILE = path.join(DATA_DIR, 'doksli.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DOKSLI_DIR)) fs.mkdirSync(DOKSLI_DIR, { recursive: true });
if (!fs.existsSync(DOKSLI_FILE)) fs.writeFileSync(DOKSLI_FILE, JSON.stringify({}), 'utf-8');

function getDB() {
    try {
        if (!fs.existsSync(DOKSLI_FILE)) return {};
        const content = fs.readFileSync(DOKSLI_FILE, 'utf-8');
        return JSON.parse(content || '{}');
    } catch {
        return {};
    }
}

function saveDB(data) {
    fs.writeFileSync(DOKSLI_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function saveMediaDoksli(groupJid, key, media, userJid) {
    const mimeToExt = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'video/mp4': 'mp4',
        'audio/ogg': 'ogg'
    };
    const ext = mimeToExt[media.mimetype] || 'dat';
    const cleanGroup = groupJid.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${cleanGroup}_${key}_${Date.now()}.${ext}`;
    const filePath = path.join(DOKSLI_DIR, filename);

    fs.writeFileSync(filePath, Buffer.from(media.data, 'base64'));

    const db = getDB();
    if (!db[groupJid]) db[groupJid] = {};
    db[groupJid][key] = {
        type: 'media',
        mimetype: media.mimetype,
        filePath: filePath,
        savedBy: userJid,
        createdAt: new Date().toISOString()
    };
    saveDB(db);
    return db[groupJid][key];
}

function saveTextDoksli(groupJid, key, text, userJid) {
    const db = getDB();
    if (!db[groupJid]) db[groupJid] = {};
    db[groupJid][key] = {
        type: 'text',
        content: text,
        savedBy: userJid,
        createdAt: new Date().toISOString()
    };
    saveDB(db);
    return db[groupJid][key];
}

function getDoksli(groupJid, key) {
    const db = getDB();
    return db[groupJid]?.[key] || null;
}

function listDoksli(groupJid) {
    const db = getDB();
    return db[groupJid] || {};
}

function deleteDoksli(groupJid, key) {
    const db = getDB();
    if (!db[groupJid] || !db[groupJid][key]) return false;

    const item = db[groupJid][key];
    if (item.type === 'media' && item.filePath && fs.existsSync(item.filePath)) {
        try {
            fs.unlinkSync(item.filePath);
        } catch (e) {
            console.error('[ERROR] Gagal menghapus file fisik doksli:', e.message);
        }
    }

    delete db[groupJid][key];
    saveDB(db);
    return true;
}

module.exports = {
    saveMediaDoksli,
    saveTextDoksli,
    getDoksli,
    listDoksli,
    deleteDoksli
};
