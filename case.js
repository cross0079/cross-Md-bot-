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
const fs = require("fs");
const path = require("path");
const settings = require("./config");
const { Reply, sendInteractive, sendCarousel, React, typing } = require("./helper/func");
const { readJSON, isPremium, uptime, formatBytes } = require("./helper/utils");
const ai = require("./ai"); // <-- CROSS AI

// ── Rent sessions DB ──
const RENT_DB = "./database/rentsessions.json";
function getRentDB() {
  if (!fs.existsSync("./database")) fs.mkdirSync("./database", { recursive: true });
  if (!fs.existsSync(RENT_DB)) fs.writeFileSync(RENT_DB, JSON.stringify({ sessions: [] }, null, 2));
  return JSON.parse(fs.readFileSync(RENT_DB, "utf-8"));
}
function saveRentDB(data) {
  fs.writeFileSync(RENT_DB, JSON.stringify(data, null, 2));
}

async function handleMessage(sock, m) {
  try {
    const jid = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const senderNum = sender.replace(/:\d+/, "").split("@")[0];
    const botNumber = (sock.user?.id || "").split(":")[0].split("@")[0];
    const isGroup = jid.endsWith("@g.us");
    const isOwner = senderNum === settings.ownerNumber.replace(/\D/g, "");

    const premDB = readJSON("./database/premium.json") || { premiumUsers: [] };
    const userIsPremium = isPremium(sender, premDB);

    if (settings.mode === "self" &&!isOwner &&!userIsPremium) return;

    const body =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption || "";

    if (!body.startsWith(settings.prefix)) return;

    const args = body.slice(settings.prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    const text = args.join(" ");

    // ── Group metadata + admin verification ──
    const groupMetadata = isGroup? await sock.groupMetadata(jid).catch(() => ({})) : {};
    const groupName = groupMetadata.subject || "";
    const participants = isGroup? (groupMetadata.participants || []).map(p => {
      let admin = null;
      if (p.admin === "superadmin") admin = "superadmin";
      else if (p.admin === "admin") admin = "admin";
      return { id: p.id || null, jid: p.jid || p.id || null, admin, full: p };
    }) : [];
    const groupAdmins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.jid || p.id);
    const isBotAdmin = isGroup? groupAdmins.includes(botNumber + "@s.whatsapp.net") || groupAdmins.includes(botNumber) : false;
    const isAdmin = isGroup? groupAdmins.includes(sender) : false;

    // ── Guards ──
    const needGroup = () => { if (!isGroup) { Reply(sock, jid, "❌ Group only command.", m); return true; } return false; };
    const needAdmin = () => { if (!isAdmin &&!isOwner) { Reply(sock, jid, "❌ Admins only.", m); return true; } return false; };
    const needBotAdmin = () => { if (!isBotAdmin) { Reply(sock, jid, "❌ Add bot as group admin first.", m); return true; } return false; };

    console.log(`[CROSS] ${senderNum} →.${command}${text? " + text : ""}`);
    await typing(sock, jid);

    switch (command) {

      // ═══════════════ MENU ═══════════════
      case "menu":
      case "help": {
        await sendCarousel(sock, jid, [
          {
            title: "⚡ GENERAL",
            body: `> ┏━━━━━━━━━━━━━━\n> ┃༆ ping\n> ┃༆ info\n> ┃༆ owner\n> ┃༆ runtime\n> ┃༆ gpt\n> ┃༆ gemini\n> ┃༆ page\n> ┗━━━━━━━━━━━━━━━─`,
            btnLabel: "📢 CHANNEL", btnUrl: settings.telegramChannel,
          },
          {
            title: "🛡️ TOOLS",
            body: `> ┏━━━━━━━━━━━━━━\n> ┃༆ checkban\n> ┃༆ checkwa\n> ┗━━━━━━━━━━━━━━━─`,
            btnLabel: "💬 GROUP", btnUrl: settings.telegramGroup,
          },
          {
            title: "👥 GROUP ADMIN",
            body: `> ┏━━━━━━━━━━━━━━\n> ┃༆ open\n> ┃༆ close\n> ┃༆ link\n> ┃༆ promote\n> ┃༆ demote\n> ┃༆ kick\n> ┃༆ setgname\n> ┃༆ setdesc\n> ┃༆ setppgc\n> ┗━━━━━━━━━━━━━━━─`,
            btnLabel: "💬 GROUP", btnUrl: settings.telegramGroup,
          },
          {
            title: "⚙️ BOT MODE",
            body: `> ┏━━━━━━━━━━━━━━\n> ┃༆ public\n> ┃༆ self\n> ┃༆ rentbot\n> ┃༆ pair\n> ┗━━━━━━━━━━━━━━━─`,
            btnLabel: "💬 GROUP", btnUrl: settings.telegramGroup,
          },
          {
            title: "👑 PREMIUM",
            body: `> ┏━━━━━━━━━━━━━━\n> ┃༆ mypremium\n> ┃༆ buypremium\n> ┗━━━━━━━━━━━━━━━─`,
            btnLabel: "💳 BUY", btnUrl: `https://wa.me/${settings.ownerNumber}`,
          },
        ], m);
        break;
      }

      // ═══════════════ GENERAL ═══════════════
      case "ping": {
        const start = Date.now();
        const ms = Date.now() - start;
        await sendInteractive(sock, jid, {
          header: "🏓 Pong!", title: "CROSS MD Speed",
          body: `⚡ Response: *${ms}ms*\n✅ CROSS MD is online`,
          footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel,
        }, m);
        break;
      }

      case "info": {
        const mem = process.memoryUsage();
        await sendInteractive(sock, jid, {
          header: `ℹ️ ${settings.botName}`, title: "CROSS MD Information",
          body:
            `🤖 *Bot:* ${settings.botName}\n` +
            `👤 *Owner:* ${settings.ownerName}\n` +
            `⏱ *Uptime:* ${uptime()}\n` +
            `💾 *RAM:* ${formatBytes(mem.heapUsed)} / ${formatBytes(mem.heapTotal)}\n` +
            `🔧 *Node:* ${process.version}\n` +
            `📦 *Library:* Baileys CROSS Fork`,
          footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel,
        }, m);
        break;
      }

      case "owner": {
        await sendInteractive(sock, jid, {
          header: "👑 Owner", title: settings.ownerName,
          body: `Contact ${settings.ownerName} for CROSS MD support, keys, or custom bots.`,
          footer: settings.footerText, btnLabel: "💬 Chat Owner",
          btnUrl: `https://wa.me/${settings.ownerNumber}`,
        }, m);
        break;
      }

      case "runtime": {
        await sendInteractive(sock, jid, {
          header: "⏱ Runtime", title: "CROSS MD Uptime",
          body: `🟢 CROSS MD Online for: *${uptime()}*`,
          footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel,
        }, m);
        break;
      }

      // ═══════════════ TOOLS ═══════════════
      case "checkban": {
        if (!text) return Reply(sock, jid, `Usage: ${settings.prefix}checkban <number>`, m);
        const numRaw = text.replace(/\D/g, "");
        await React(sock, m, "🔍");
        try {
          const [result] = await sock.onWhatsApp(numRaw + "@s.whatsapp.net");
          const exists = result?.exists === true;
          await sendInteractive(sock, jid, {
            header: "🛡️ CROSS Ban Checker",
            title: exists? "✅ Not Banned" : "🚫 Banned / Not Found",
            body: `📱 *Number:* +${numRaw}\n\n${exists? "✅ *Status:* Active on WhatsApp\n🟢 Not banned" : "🚫 *Status:* BANNED or not on WhatsApp"}`,
            footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel,
          }, m);
        } catch (e) {
          await Reply(sock, jid, `❌ Error: ${e.message}`, m);
        }
        break;
      }

      case "checkwa": {
        if (!text) return Reply(sock, jid, `Usage: ${settings.prefix}checkwa <number>`, m);
        const numRaw = text.replace(/\D/g, "");
        await React(sock, m, "🔍");
        try {
          const [result] = await sock.onWhatsApp(numRaw + "@s.whatsapp.net");
          const exists = result?.exists === true;
          await sendInteractive(sock, jid, {
            header: "📱 CROSS WhatsApp Checker",
            title: exists? "✅ On WhatsApp" : "❌ Not on WhatsApp",
            body: `📱 *Number:* +${numRaw}\n\n${exists? "✅ *Registered* on WhatsApp\n📲 Number is active" : "❌ *Not registered* on WhatsApp\n📵 Not found"}`,
            footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel,
          }, m);
        } catch (e) {
          await Reply(sock, jid, `❌ Error: ${e.message}`, m);
        }
        break;
      }

      // ═══════════════ GROUP ADMIN ═══════════════
      case "open": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        await sock.groupSettingUpdate(jid, "not_announcement");
        await React(sock, m, "🔓");
        await sendInteractive(sock, jid, { header: "🔓 Group Opened", title: groupName, body: `✅ CROSS MD: Group is now *OPEN*`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "close": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        await sock.groupSettingUpdate(jid, "announcement");
        await React(sock, m, "🔒");
        await sendInteractive(sock, jid, { header: "🔒 Group Closed", title: groupName, body: `🔒 CROSS MD: Group is now *CLOSED*`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "link": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        const code = await sock.groupInviteCode(jid);
        await sendInteractive(sock, jid, { header: "🔗 CROSS Group Link", title: groupName, body: `🔗 *Invite Link:*\nhttps://chat.whatsapp.com/${code}`, footer: settings.footerText, btnLabel: "🔗 Join Group", btnUrl: `https://chat.whatsapp.com/${code}` }, m);
        break;
      }

      case "promote": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        const target = ctx?.mentionedJid?.[0] || ctx?.participant || (text.replace(/\D/g, "")? text.replace(/\D/g, "") + "@s.whatsapp.net" : null);
        if (!target) return Reply(sock, jid, `Usage: ${settings.prefix}promote @user or reply`, m);
        await sock.groupParticipantsUpdate(jid, [target], "promote");
        await React(sock, m, "⭐");
        await sendInteractive(sock, jid, { header: "⭐ Promoted", title: groupName, body: `⭐ @${target.split("@")[0]} is now *CROSS Admin*!`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "demote": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        const target = ctx?.mentionedJid?.[0] || ctx?.participant || (text.replace(/\D/g, "")? text.replace(/\D/g, "") + "@s.whatsapp.net" : null);
        if (!target) return Reply(sock, jid, `Usage: ${settings.prefix}demote @user or reply`, m);
        await sock.groupParticipantsUpdate(jid, [target], "demote");
        await React(sock, m, "⬇️");
        await sendInteractive(sock, jid, { header: "⬇️ Demoted", title: groupName, body: `⬇️ @${target.split("@")[0]} is no longer CROSS Admin.`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "kick": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        const target = ctx?.mentionedJid?.[0] || ctx?.participant || (text.replace(/\D/g, "")? text.replace(/\D/g, "") + "@s.whatsapp.net" : null);
        if (!target) return Reply(sock, jid, `Usage: ${settings.prefix}kick @user or reply`, m);
        if (target.split("@")[0] === botNumber) return Reply(sock, jid, "❌ CROSS MD cannot kick itself.", m);
        await sock.groupParticipantsUpdate(jid, [target], "remove");
        await React(sock, m, "👢");
        await sendInteractive(sock, jid, { header: "👢 Kicked", title: groupName, body: `👢 @${target.split("@")[0]} removed by CROSS MD.`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "setgname": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        if (!text) return Reply(sock, jid, `Usage: ${settings.prefix}setgname <name>`, m);
        await sock.groupUpdateSubject(jid, text);
        await React(sock, m, "✏️");
        await sendInteractive(sock, jid, { header: "✏️ Renamed", title: text, body: `✅ CROSS MD: Group name: *${text}*`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "setdesc": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        if (!text) return Reply(sock, jid, `Usage: ${settings.prefix}setdesc <text>`, m);
        await sock.groupUpdateDescription(jid, text);
        await React(sock, m, "📝");
        await sendInteractive(sock, jid, { header: "📝 Description", title: groupName, body: `✅ CROSS MD Desc set:\n\n${text}`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "setppgc": {
        if (needGroup() || needAdmin() || needBotAdmin()) break;
        const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imgMsg = m.message?.imageMessage || quotedMsg?.imageMessage;
        if (!imgMsg) return Reply(sock, jid, `Send/quote image with ${settings.prefix}setppgc`, m);
        const { downloadMediaMessage } = require("@whiskeysockets/baileys");
        const buf = await downloadMediaMessage(quotedMsg? { message: quotedMsg, key: { remoteJid: jid, id: m.message.extendedTextMessage.contextInfo.stanzaId, fromMe: false } : m, "buffer", {}, { logger: { info(){}, error(){}, warn(){}, debug(){}, child(){ return this; } });
        await sock.updateProfilePicture(jid, buf);
        await React(sock, m, "🖼️");
        await sendInteractive(sock, jid, { header: "🖼️ Updated", title: groupName, body: `✅ CROSS MD: Group PP updated!`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      // ═══════════════ BOT MODE ═══════════════
      case "public": {
        if (!isOwner) return Reply(sock, jid, "❌ CROSS MD Owner only.", m);
        settings.mode = "public";
        await React(sock, m, "🌍");
        await sendInteractive(sock, jid, { header: "🌍 Public Mode", title: "CROSS MD Mode", body: `🌍 CROSS MD is now *PUBLIC*`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "self": {
        if (!isOwner &&!userIsPremium) return Reply(sock, jid, "❌ CROSS MD Owner/Premium only.", m);
        settings.mode = "self";
        await React(sock, m, "🔒");
        await sendInteractive(sock, jid, { header: "🔒 Self Mode", title: "CROSS MD Mode", body: `🔒 CROSS MD is now *SELF*`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      // ═══════════════ RENTBOT / PAIR ═══════════════
      case "rentbot":
      case "pair":
      case "bot": {
        if (!isOwner) return Reply(sock, jid, "❌ CROSS MD Owner only.", m);
        if (!text) return Reply(sock, jid, `Usage: ${settings.prefix}${command} <number>`, m);
        const rentNum = text.replace(/\D/g, "");
        if (rentNum.length < 7) return Reply(sock, jid, "❌ Invalid number.", m);
        const rentDB = getRentDB();
        if (rentDB.sessions.find(s => s.number === rentNum)) return Reply(sock, jid, `⚠️ CROSS Session for *${rentNum}* exists.`, m);
        const sessionDir = path.resolve(`./session/rent_${rentNum}`);
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
        const configPath = `./database/rent_${rentNum}.json`;
        fs.writeFileSync(configPath, JSON.stringify({ number: rentNum, sessionId: `rent_${rentNum}`, sessionDir, prefix: settings.prefix, botName: settings.botName, ownerNumber: settings.ownerNumber, createdAt: new Date().toISOString(), active: false }, null, 2));
        rentDB.sessions.push({ number: rentNum, configPath, sessionDir, active: false });
        saveRentDB(rentDB);
        await React(sock, m, "✅");
        await sendInteractive(sock, jid, { header: "🤖 CROSS Rent Bot", title: "Session Created", body: `✅ CROSS Session for *+${rentNum}*\n📁 session/rent_${rentNum}\n📄 database/rent_${rentNum}.json\n\nRestart to load.`, footer: settings.footerText, btnLabel: "📢 Channel", btnUrl: settings.telegramChannel }, m);
        break;
      }

      // ═══════════════ CROSS AI ═══════════════
      case "gpt":
      case "gemini": {
        return await ai(sock, jid, m);
      }

      case "page":
      case "ad": {
        await sendInteractive(sock, jid, {
          header: "☠️ CROSS MD AD",
          title: "Get CROSS MD Bot",
          body: `🤖 *CROSS MD* - The Fastest WhatsApp Bot 2026\n\n✨ AI, Sticker, Downloader, Anti-Delete & More\n👑 *Owner:* ${settings.ownerName}\n📢 *Channel:* ${settings.telegramChannel}`,
          footer: settings.footerText, btnLabel: "📢 Join Channel", btnUrl: settings.telegramChannel,
        }, m);
        break;
      }

      // ═══════════════ PREMIUM ═══════════════
      case "mypremium": {
        await sendInteractive(sock, jid, { header: "👑 CROSS Premium", title: "Account", body: `📱 *${senderNum}*\n${userIsPremium? "✅ *CROSS Premium*" : "❌ *Free*"}`, footer: settings.footerText, btnLabel: userIsPremium? "✅ Active" : "💳 Get Premium", btnUrl: settings.telegramChannel }, m);
        break;
      }

      case "buypremium": {
        await sendInteractive(sock, jid, { header: "💳 Buy CROSS Premium", title: "Unlock All", body: `Contact ${settings.ownerName} for CROSS MD Premium.`, footer: settings.footerText, btnLabel: "💬 Owner", btnUrl: `https://wa.me/${settings.ownerNumber}` }, m);
        break;
      }

      case "addpremium": {
        if (!isOwner) return Reply(sock, jid, "❌ CROSS MD Owner only.", m);
        if (!text) return Reply(sock, jid, `Usage: ${settings.prefix}addpremium <number>`, m);
        const num = text.replace(/\D/g, "");
        if (!premDB.premiumUsers.includes(num)) premDB.premiumUsers.push(num);
        fs.writeFileSync("./database/premium.json", JSON.stringify(premDB, null, 2));
        await React(sock, m, "✅");
        await Reply(sock, jid, `✅ *${num}* added to CROSS Premium.`, m);
        break;
      }

      case "delpremium": {
        if (!isOwner) return Reply(sock, jid, "❌ CROSS MD Owner only.", m);
        if (!text) return Reply(sock, jid, `Usage: ${settings.prefix}delpremium <number>`, m);
        const num = text.replace(/\D/g, "");
        premDB.premiumUsers = premDB.premiumUsers.filter(n => n!== num);
        fs.writeFileSync("./database/premium.json", JSON.stringify(premDB, null, 2));
        await React(sock, m, "✅");
        await Reply(sock, jid, `✅ *${num}* removed from CROSS Premium.`, m);
        break;
      }

      case "listpremium": {
        if (!isOwner) return Reply(sock, jid, "❌ CROSS MD Owner only.", m);
        if (!premDB.premiumUsers.length) return Reply(sock, jid, "📋 No CROSS Premium users.", m);
        await Reply(sock, jid, `👑 *CROSS Premium Users:*\n\n${premDB.premiumUsers.map((n, i) => `${i + 1}. ${n}`).join("\n")}`, m);
        break;
      }

      default: break;
    }
  } catch (err) {
    console.error("[CROSS case.js] Error:", err);
  }
}

module.exports = { handleMessage };
