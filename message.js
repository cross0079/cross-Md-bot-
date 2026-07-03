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
const fs = require("fs");
const settings = require("../settings");
const { generateWAMessageContent, generateWAMessageFromContent } = require("@whiskeysockets/baileys");
const handleCase = require("./case.js");

const NEWSLETTER_JID = "120363351424590490@newsletter";
const MENU_IMG = "./media/menu.jpg";
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
┃ https://github.com/cross0079/cross-Md-bot-
╰━━━〔 ☠️ 〕━━━⬣`;

async function Reply(sock, jid, text, quoted, options = {}) {
  return sock.sendMessage(
    jid,
    {
      text,
      contextInfo: {
        mentionedJid: options.mentions || [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_JID,
          serverMessageId: -1,
          newsletterName: settings.botName,
        },
        externalAdReply: {
          title: settings.botName,
          body: settings.footerText,
          mediaType: 1,
          thumbnailUrl: "",
          sourceUrl: settings.github,
          showAdAttribution: true,
          renderLargerThumbnail: false,
        },
      },
    },
    { quoted }
  );
}

async function sendInteractive(sock, jid, { header, title, body, footer, btnLabel, btnUrl }, quoted) {
  const imgBuffer = fs.existsSync(MENU_IMG)? fs.readFileSync(MENU_IMG) : null;
  return sock.sendMessage(jid, {
    interactiveMessage: {
      header: header || settings.botName,
      title: title || "", body: body || "", footer: footer || settings.footerText,
     ...(imgBuffer? { image: imgBuffer } : {}),
      contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: NEWSLETTER_JID, serverMessageId: -1, newsletterName: settings.botName }, externalAdReply: { title: settings.botName, body: settings.footerText, mediaType: 3, thumbnailUrl: "", sourceUrl: settings.github, showAdAttribution: true, renderLargerThumbnail: false }},
      buttons: [{ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: btnLabel || "View", url: btnUrl || settings.github, merchant_url: btnUrl || settings.github })}],
    },
  }, { quoted });
}

async function sendCarousel(sock, jid, cards, quoted) {
  const imgPath = fs.existsSync(MENU_IMG)? MENU_IMG : null;
  const carouselCards = await Promise.all(cards.map(async (card, index) => {
    const imageMsg = imgPath ? (await generateWAMessageContent({ image: fs.readFileSync(imgPath) }, { upload: sock.waUploadToServer })).imageMessage : null;
    return { header: { title: card.title || "", hasMediaAttachment:!!imageMsg, ...(imageMsg? { imageMessage: imageMsg } : {})}, body: { text: card.body || "" }, footer: { text: card.footer || `📖 ${index + 1} of ${cards.length} | ${settings.footerText}` }, nativeFlowMessage: { buttons: [{ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: card.btnLabel || "View", url: card.btnUrl || settings.github, merchant_url: card.btnUrl || settings.github })}] }};
  }));
  const carouselMsg = generateWAMessageFromContent(jid, { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, interactiveMessage: { body: { text: settings.botName }, footer: { text: "Swipe ⬅️➡️ to explore" }, carouselMessage: { cards: carouselCards }}}}, { quoted });
  return sock.relayMessage(jid, carouselMsg.message, { messageId: carouselMsg.key.id });
}

async function React(sock, msg, emoji) { return sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key }}); }
async function typing(sock, jid, duration = 1500) { await sock.sendPresenceUpdate("composing", jid); await new Promise((r) => setTimeout(r, duration)); await sock.sendPresenceUpdate("paused", jid); }

// ROUTER
module.exports = async (sock, msg) => {
  if (!msg.message) return;
  const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  if (!body.startsWith(PREFIX)) return;
  const [command,...args] = body.slice(PREFIX.length).trim().split(/ +/);
  await handleCase(sock, msg, args, command.toLowerCase(), { Reply, sendInteractive, sendCarousel, React, typing, BANNER, MENU_IMG, PREFIX });
}

module.exports.utils = { Reply, sendInteractive, sendCarousel, React, typing, BANNER, MENU_IMG, PREFIX };
