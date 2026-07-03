/*
╭━━━〔 CROSS 〕━━━⬣
┃『CROSS〆 𝘾̷𝙍̷𝙊̷𝙎̷𝙎̷ 𝙈̷𝘿̷ 𝘽̷𝙤̷𝙩̷ ☠️』
┣━━━━━━━━⬣
┃『死神 • 𝙊̷𝙬̷𝙣̷𝙚̷𝙧̷ : ༄𝐌𝐑.𝐂𝐑𝐎𝐒』
┃『黒龍 • 𝙏̷𝙮̷𝙥̷𝙚̷ : 𝘾̷𝙖̷𝙨̷𝙚̷』
┃『闇ノ • 𝙏̷𝙮̷𝙥̷𝙚̷ : 𝘽̷𝙪̷𝙩̷𝙩̷𝙤̷𝙣̷𝙨̷』
┃『零式 • 𝘾̷𝙧̷𝙚̷𝙙̷𝙞̷𝙩̷ : 𝐌𝐑.𝐂𝐑𝐎𝐒𝐓𝐄𝐂𝐇』
┣━━━━━━━━⬣
┃『月読 • 𝘾̷𝙝̷𝙖̷𝙣̷𝙣̷𝙚̷𝙡̷』
┃ https://t.me/mr_crosstech
╰━━━〔 ☠️ 〕━━━⬣
*/
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const webp = require('node-webpmux');
const crypto = require('crypto');
const fetch = require('node-fetch'); // npm i node-fetch@2

const ANIMU_BASE = 'https://api.some-random-api.com/animu';
const PREFIX = '.';

const BANNER = `╭━━━〔 CROSS 〕━━━⬣
┃『CROSS〆 𝘾̷𝙍̷𝙊̷𝙎̷𝙎̷ 𝙈̷𝘿̷ 𝘽̷𝙤̷𝙩̷ ☠️』
┣━━━━━━━━⬣
┃『死神 • 𝙊̷𝙬̷𝙣̷𝙚̷𝙧̷ : ༄𝐌𝐑.𝐂𝐑𝐎𝐒』
┃『黒龍 • 𝙏̷𝙮̷𝙥̷𝙚̷ : 𝘾̷𝙖̷𝙨̷𝙚̷』
┃『闇ノ • 𝙏̷𝙮̷𝙥̷𝙚̷ : 𝘽̷𝙪̷𝙩̷𝙩̷𝙤̷𝙣̷𝙨̷』
┃『零式 • 𝘾̷𝙧̷𝙚̷𝙙̷𝙞̷𝙩̷ : 𝐌𝐑.𝐂𝐑𝐎𝐒𝐓𝐄𝐂𝐇』
┣━━━━━━━━⬣
┃『月読 • 𝘾̷𝙝̷𝙖̷𝙣̷𝙣̷𝙚̷𝙡̷』
┃ https://t.me/mr_crosstech
╰━━━〔 ☠️ 〕━━━⬣`;

// ====== LIB: ANIMU COMMAND ======
function normalizeType(input) {
    const lower = (input || '').toLowerCase();
    if (lower === 'facepalm' || lower === 'face_palm') return 'face-palm';
    if (lower === 'quote' || lower === 'animu-quote' || lower === 'animuquote') return 'quote';
    return lower;
}

async function sendAnimu(sock, chatId, msg, type) {
    try {
        const res = await axios.get(`${ANIMU_BASE}/${type}`);
        const data = res.data || {};
        if (!data.link &&!data.quote) return sock.sendMessage(chatId, { text: '❌ Failed to fetch animu.' }, { quoted: msg });

        if (data.link) {
            const link = data.link;
            const isGif = link.toLowerCase().endsWith('.gif');
            const isImg = /\.(jpg|jpeg|png|webp)$/i.test(link);

            if (isGif || isImg) {
                try {
                    const resp = await axios.get(link, { responseType: 'arraybuffer', timeout: 15000 });
                    const sticker = await toSticker(Buffer.from(resp.data), isGif);
                    return sock.sendMessage(chatId, { sticker }, { quoted: msg });
                } catch {}
            }
            return sock.sendMessage(chatId, { image: { url: link }, caption: `🎌 anime: ${type}` }, { quoted: msg });
        }
        if (data.quote) return sock.sendMessage(chatId, { text: data.quote }, { quoted: msg });
    } catch {
        return sock.sendMessage(chatId, { text: '❌ An error occurred while fetching animu.' }, { quoted: msg });
    }
}

async function toSticker(mediaBuffer, isAnimated) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const input = path.join(tmpDir, `animu_${Date.now()}.${isAnimated? 'gif' : 'jpg'}`);
    const output = path.join(tmpDir, `animu_${Date.now()}.webp`);
    fs.writeFileSync(input, mediaBuffer);

    const ffmpegCmd = isAnimated
      ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -c:v libwebp -loop 0 -quality 60 "${output}"`
        : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000" -c:v libwebp -loop 0 -quality 75 "${output}"`;

    await new Promise((resolve, reject) => exec(ffmpegCmd, err => err? reject(err) : resolve()));
    let webpBuffer = fs.readFileSync(output);

    const img = new webp.Image();
    await img.load(webpBuffer);
    const json = { 'sticker-pack-id': crypto.randomBytes(32).toString('hex'), 'sticker-pack-name': 'Anime Stickers', 'emojis': ['🎌'] };
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const exif = Buffer.concat([exifAttr, Buffer.from(JSON.stringify(json), 'utf8')]);
    exif.writeUIntLE(JSON.stringify(json).length, 14, 4);
    img.exif = exif;
    const finalBuffer = await img.save(null);
    fs.unlinkSync(input); fs.unlinkSync(output);
    return finalBuffer;
}
// ====== END LIB ======

module.exports = async (sock, msg, args, command) => {
  const jid = msg.key.remoteJid;
  const sender = msg.key.participant || jid;
  const text = args.join(' ');
  const reply = (txt) => sock.sendMessage(jid, { text: txt }, { quoted: msg });

  switch(command.toLowerCase()) {

    // === GENERAL ===
    case 'ping':
      return reply(`${BANNER}\n\n✅ Pong! ${Date.now() - msg.messageTimestamp * 1000}ms`);

    case 'menu': case 'help':
      return reply(`${BANNER}\n\n*COMMAND LIST*\n${PREFIX}ping ${PREFIX}alive ${PREFIX}menu ${PREFIX}list ${PREFIX}owner ${PREFIX}repo ${PREFIX}jid\n${PREFIX}sticker ${PREFIX}toimg ${PREFIX}lyrics ${PREFIX}ytmp3 ${PREFIX}animu\n\nType ${PREFIX}list for all 46 commands`);

    case 'list':
      return reply(`${BANNER}\n\n*ALL 46 COMMANDS*\n1.ping 2.menu 3.list 4.alive 5.owner 6.repo 7.jid 8.sticker 9.toimg 10.lyrics 11.ytmp3 12.ytmp4 13.tiktok 14.fb 15.ig 16.google 17.yts 18.pinterest 19.joke 20.quote 21.fact 22.truth 23.dare 24.emojimix 25.ai 26.gpt 27.imagine 28.tts 29.tinyurl 30.blur 31.removebg 32.take 33.block 34.unblock 35.broadcast 36.join 37.leave 38.ssweb 39.weather 40.news 41.calc 42.translate 43.tagall 44.hidetag 45.groupinfo 46.animu`);

    case 'alive': return reply(`${BANNER}\n\n*STATUS:* Online ✅\n*Version:* v3.0.0`);
    case 'owner': return reply(`${BANNER}\n\n*Owner:* ༄𝐌𝐑.𝐂𝐑𝐎𝐒\n*Wa.me:* wa.me/234...`); // change number
    case 'repo': return reply(`${BANNER}\n\n*Github:* https://github.com/cross0079/cross-Md-bot-`);
    case 'jid': return reply(`${BANNER}\n\n*Chat:* ${jid}\n*You:* ${sender}`);

    // === MEDIA ===
    case 'sticker':
      if(!msg.message.imageMessage &&!msg.message.videoMessage) return reply(`Reply to image/video with ${PREFIX}sticker`);
      return reply(`Sticker feature: needs to be added to case.js util.`);
    case 'toimg': return reply(`Reply to a sticker with ${PREFIX}toimg`);

    // === SEARCH/DOWNLOAD ===
    case 'lyrics':
      if(!text) return reply(`Usage: ${PREFIX}lyrics <song name>`);
      try {
        const res = await fetch(`https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return reply(`*${text.toUpperCase()}*\n\n${data?.result?.lyrics?.slice(0, 3000) || 'Not found'}`);
      } catch { return reply('❌ Error fetching lyrics'); }

    case 'ytmp3': case 'ytmp4': case 'tiktok': case 'fb': case 'ig':
      if(!text) return reply(`Usage: ${PREFIX}${command} <link>`);
      return reply(`⏳ Downloading ${command}... API not connected`);

    case 'google': case 'yts': case 'pinterest':
      if(!text) return reply(`Usage: ${PREFIX}${command} <query>`);
      return reply(`🔍 Searching ${command}: ${text}`);

    // === FUN ===
    case 'joke': return reply('Why did the bot cross the road? To get to your chat 😂');
    case 'quote': return reply('"Consistency is key" - CROSS MD');
    case 'fact': return reply('Octopuses have 3 hearts.');
    case 'truth': return reply('Truth: What\'s your biggest secret? 😏');
    case 'dare': return reply('Dare: Send a voice note saying "CROSS MD is goat"');
    case 'emojimix': return!text.includes('+')? reply(`Usage: ${PREFIX}emojimix 😂+😎`) : reply(`Mixed: ${text}`);

    // === AI ===
    case 'ai': case 'gpt':
      if(!text) return reply(`Usage: ${PREFIX}${command} <question>`);
      return reply(`🤖 AI: ${text}\n[Add API key in config.js]`);
    case 'imagine': return!text? reply(`Usage: ${PREFIX}imagine <prompt>`) : reply(`🎨 Generating: ${text}`);

    // === CONVERT ===
    case 'tts': return!text? reply(`Usage: ${PREFIX}tts <text>`) : reply(`🔊 TTS: ${text}`);
    case 'tinyurl': return!text? reply(`Usage: ${PREFIX}tinyurl <link>`) : reply(`🔗 Short: https://tinyurl.com/demo`);

    // === EDIT ===
    case 'blur': case 'removebg': case 'take': return reply(`🖼️ ${command} needs image utils installed`);

    // === OWNER ONLY ===
    case 'block': case 'unblock': case 'broadcast': case 'join': case 'leave':
      return reply(`⚙️ ${command} executed. [Add owner check]`);

    // === OTHER ===
    case 'ssweb': return!text? reply(`Usage: ${PREFIX}ssweb <url>`) : reply(`📸 Screenshot: ${text}`);
    case 'weather': case 'news': return!text? reply(`Usage: ${PREFIX}${command} <query>`) : reply(`${command}: ${text}`);
    case 'calc': try { return reply(`🧮 Result: ${eval(text)}`); } catch { return reply('Invalid math'); }
    case 'translate': return!text? reply(`Usage: ${PREFIX}translate <text>`) : reply(`🌐 Translated: ${text}`);

    // === GROUP ===
    case 'tagall':
      if(!jid.endsWith('@g.us')) return reply('❌ Group only');
      const members = await sock.groupMetadata(jid).then(g => g.participants.map(p => p.id));
      return sock.sendMessage(jid, { text: text || '📢 Tagging all', mentions: members });
    case 'hidetag':
      if(!jid.endsWith('@g.us')) return reply('❌ Group only');
      const all = await sock.groupMetadata(jid).then(g => g.participants.map(p => p.id));
      return sock.sendMessage(jid, { text: text, mentions: all }, { quoted: msg });
    case 'groupinfo':
      if(!jid.endsWith('@g.us')) return reply('❌ Group only');
      const meta = await sock.groupMetadata(jid);
      return reply(`${BANNER}\n\n*Group:* ${meta.subject}\n*Members:* ${meta.participants.length}\n*Desc:* ${meta.desc || 'None'}`);

    // === ANIME 46 ===
    case 'animu':
      const type = args[0] || '';
      return await sendAnimu(sock, jid, msg, normalizeType(type));

    default: return;
  }
}
