
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
┃ https://github.com/cross0079/cross-Md-bot-
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

// ANIMU LIB
function normalizeType(input) { const lower = (input || '').toLowerCase(); if (lower === 'facepalm' || lower === 'face_palm') return 'face-palm'; if (lower === 'quote' || lower === 'animu-quote' || lower === 'animuquote') return 'quote'; return lower; }
async function toSticker(mediaBuffer, isAnimated) { const tmpDir = path.join(process.cwd(), 'tmp'); if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true }); const input = path.join(tmpDir, `animu_${Date.now()}.${isAnimated? 'gif' : 'jpg'}`); const output = path.join(tmpDir, `animu_${Date.now()}.webp`); fs.writeFileSync(input, mediaBuffer); const ffmpegCmd = isAnimated? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000,fps=15" -c:v libwebp -loop 0 -quality 60 "${output}"` : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000" -c:v libwebp -loop 0 -quality 75 "${output}"`; await new Promise((resolve, reject) => exec(ffmpegCmd, err => err? reject(err) : resolve())); let webpBuffer = fs.readFileSync(output); const img = new webp.Image(); await img.load(webpBuffer); const json = { 'sticker-pack-id': crypto.randomBytes(32).toString('hex'), 'sticker-pack-name': 'Anime Stickers', 'emojis': ['🎌'] }; const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]); const exif = Buffer.concat([exifAttr, Buffer.from(JSON.stringify(json), 'utf8')]); exif.writeUIntLE(JSON.stringify(json).length, 14, 4); img.exif = exif; const finalBuffer = await img.save(null); fs.unlinkSync(input); fs.unlinkSync(output); return finalBuffer; }
async function sendAnimu(sock, jid, msg, type, { Reply }) { try { const res = await axios.get(`${ANIMU_BASE}/${type}`); const data = res.data || {}; if (!data.link &&!data.quote) return Reply(sock, jid, '❌ Failed to fetch animu.', msg); if (data.link) { const link = data.link; const isGif = link.toLowerCase().endsWith('.gif'); const isImg = /\.(jpg|jpeg|png|webp)$/i.test(link); if (isGif || isImg) { try { const resp = await axios.get(link, { responseType: 'arraybuffer', timeout: 15000 }); const sticker = await toSticker(Buffer.from(resp.data), isGif); return sock.sendMessage(jid, { sticker }, { quoted: msg }); } catch {} return sock.sendMessage(jid, { image: { url: link }, caption: `🎌 anime: ${type}` }, { quoted: msg }); } if (data.quote) return Reply(sock, jid, data.quote, msg); } } catch { return Reply(sock, jid, '❌ An error occurred while fetching animu.', msg); } }

module.exports = async (sock, msg, args, command, utils) => {
  const { Reply, BANNER, PREFIX } = utils;
  const jid = msg.key.remoteJid;
  const text = args.join(' ');

  switch(command) {
    case 'ping': return Reply(sock, jid, `${BANNER}\n\n✅ Pong! ${Date.now() - msg.messageTimestamp * 1000}ms`, msg);
    case 'menu': case 'help': return Reply(sock, jid, `${BANNER}\n\n*COMMAND LIST*\n${PREFIX}ping ${PREFIX}alive ${PREFIX}menu ${PREFIX}list ${PREFIX}owner ${PREFIX}repo ${PREFIX}jid\n${PREFIX}sticker ${PREFIX}toimg ${PREFIX}lyrics ${PREFIX}ytmp3 ${PREFIX}animu\n\nType ${PREFIX}list for all 46`, msg);
    case 'list': return Reply(sock, jid, `${BANNER}\n\n*ALL 46 COMMANDS*\n1.ping 2.menu 3.list 4.alive 5.owner 6.repo 7.jid 8.sticker 9.toimg 10.lyrics 11.ytmp3 12.ytmp4 13.tiktok 14.fb 15.ig 16.google 17.yts 18.pinterest 19.joke 20.quote 21.fact 22.truth 23.dare 24.emojimix 25.ai 26.gpt 27.imagine 28.tts 29.tinyurl 30.blur 31.removebg 32.take 33.block 34.unblock 35.broadcast 36.join 37.leave 38.ssweb 39.weather 40.news 41.calc 42.translate 43.tagall 44.hidetag 45.groupinfo 46.animu`, msg);
    case 'alive': return Reply(sock, jid, `${BANNER}\n\n*STATUS:* Online ✅\n*Version:* v3.0.0`, msg);
    case 'owner': return Reply(sock, jid, `${BANNER}\n\n*Owner:* ༄𝐌𝐑.𝐂𝐑𝐎𝐒\n*Wa.me:* wa.me/234...`, msg); // change number
    case 'repo': return Reply(sock, jid, `${BANNER}\n\n*Github:* https://github.com/cross0079/cross-Md-bot-`, msg);
    case 'jid': return Reply(sock, jid, `${BANNER}\n\n*Chat:* ${jid}\n*You:* ${msg.key.participant || jid}`, msg);

    case 'sticker': if(!msg.message.imageMessage &&!msg.message.videoMessage) return Reply(sock, jid, `Reply to image/video with ${PREFIX}sticker`, msg); return Reply(sock, jid, `Sticker: add ffmpeg utils`, msg);
    case 'toimg': return Reply(sock, jid, `Reply to a sticker with ${PREFIX}toimg`, msg);

    case 'lyrics': if(!text) return Reply(sock, jid, `Usage: ${PREFIX}lyrics <song name>`, msg); try { const res = await fetch(`https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(text)}`); const data = await res.json(); return Reply(sock, jid, `*${text.toUpperCase()}*\n\n${data?.result?.lyrics?.slice(0, 3000) || 'Not found'}`, msg); } catch { return Reply(sock, jid, '❌ Error fetching lyrics', msg); }

    case 'ytmp3': case 'ytmp4': case 'tiktok': case 'fb': case 'ig': if(!text) return Reply(sock, jid, `Usage: ${PREFIX}${command} <link>`, msg); return Reply(sock, jid, `⏳ Downloading ${command}... API not connected`, msg);
    case 'google': case 'yts': case 'pinterest': if(!text) return Reply(sock, jid, `Usage: ${PREFIX}${command} <query>`, msg); return Reply(sock, jid, `🔍 Searching ${command}: ${text}`, msg);

    case 'joke': return Reply(sock, jid, 'Why did the bot cross the road? To get to your chat 😂', msg);
    case 'quote': return Reply(sock, jid, '"Consistency is key" - CROSS MD', msg);
    case 'fact': return Reply(sock, jid, 'Octopuses have 3 hearts.', msg);
    case 'truth': return Reply(sock, jid, 'Truth: What\'s your biggest secret? 😏', msg);
    case 'dare': return Reply(sock, jid, 'Dare: Send a voice note saying "CROSS MD is goat"', msg);
    case 'emojimix': return!text.includes('+')? Reply(sock, jid, `Usage: ${PREFIX}emojimix 😂+😎`, msg) : Reply(sock, jid, `Mixed: ${text}`, msg);

    case 'ai': case 'gpt': if(!text) return Reply(sock, jid, `Usage: ${PREFIX}${command} <question>`, msg); return Reply(sock, jid, `🤖 AI: ${text}\n[Add API key in config.js]`, msg);
    case 'imagine': return!text? Reply(sock, jid, `Usage: ${PREFIX}imagine <prompt>`, msg) : Reply(sock, jid, `🎨 Generating: ${text}`, msg);

    case 'tts': return!text? Reply(sock, jid, `Usage: ${PREFIX}tts <text>`, msg) : Reply(sock, jid, `🔊 TTS: ${text}`, msg);
    case 'tinyurl': return!text? Reply(sock, jid, `Usage: ${PREFIX}tinyurl <link>`, msg) : Reply(sock, jid, `🔗 Short: https://tinyurl.com/demo`, msg);

    case 'blur': case 'removebg': case 'take': return Reply(sock, jid, `🖼️ ${command} needs image utils installed`, msg);
    case 'block': case 'unblock': case 'broadcast': case 'join': case 'leave': return Reply(sock, jid, `⚙️ ${command} executed. [Add owner check]`, msg);
    case 'ssweb': return!text? Reply(sock, jid, `Usage: ${PREFIX}ssweb <url>`, msg) : Reply(sock, jid, `📸 Screenshot: ${text}`, msg);
    case 'weather': case 'news': return!text? Reply(sock, jid, `Usage: ${PREFIX}${command} <query>`, msg) : Reply(sock, jid, `${command}: ${text}`, msg);
    case 'calc': try { return Reply(sock, jid, `🧮 Result: ${eval(text)}`, msg); } catch { return Reply(sock, jid, 'Invalid math', msg); }
    case 'translate': return!text? Reply(sock, jid, `Usage: ${PREFIX}translate <text>`, msg) : Reply(sock, jid, `🌐 Translated: ${text}`, msg);

    case 'tagall': if(!jid.endsWith('@g.us')) return Reply(sock, jid, '❌ Group only', msg); const members = await sock.groupMetadata(jid).then(g => g.participants.map(p => p.id)); return sock.sendMessage(jid, { text: text || '📢 Tagging all', mentions: members }, { quoted: msg });
    case 'hidetag': if(!jid.endsWith('@g.us')) return Reply(sock, jid, '❌ Group only', msg); const all = await sock.groupMetadata(jid).then(g => g.participants.map(p => p.id)); return sock.sendMessage(jid, { text: text, mentions: all }, { quoted: msg });
    case 'groupinfo': if(!jid.endsWith('@g.us')) return Reply(sock, jid, '❌ Group only', msg); const meta = await sock.groupMetadata(jid); return Reply(sock, jid, `${BANNER}\n\n*Group:* ${meta.subject}\n*Members:* ${meta.participants.length}\n*Desc:* ${meta.desc || 'None'}`, msg);

    case 'animu': return await sendAnimu(sock, jid, msg, normalizeType(args[0] || ''), utils);
    default: return;
  }
}
