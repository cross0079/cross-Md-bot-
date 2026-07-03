/*
╭━━━〔 CROSS 〕━━━⬣
┃『CROSS〆 𝘾̷𝙍̷𝙊̷𝙎̷𝙎̷ 𝙈̷𝘿̷ 𝘽̷𝙤̷𝙩̷ ☠️』
┣━━━━━━━━⬣
┃『死神 • 𝙊̷𝙬̷𝙣̷𝙚̷𝙧̷ : ༄𝐌𝐑.𝐂𝐑𝐎𝐒』
┃『黒龍 • 𝙏̷𝙮̷𝙥̷𝙚̷ : 𝘾̷𝙖̷𝙨̷𝙚̷』
┃『闇ノ • 𝙏̷𝙮̷𝙥̷𝙚̷ : 𝘽̷𝙪̷𝙩̷𝙩̷𝙤̷𝙣̷𝙨̷』
┃『零式 • 𝘾̷𝙧̷𝙚̷𝙙̷𝙞̷𝙩̷ : 𝐌𝐑.𝐂𝐑𝐎𝐒𝐒𝐓𝐄𝐂𝐇』
┣━━━━━━━━⬣
┃『月読 • 𝘾̷𝙝̷𝙖̷𝙣̷𝙣̷𝙚̷𝙡̷』
┃ https://t.me/mr_crosstech
╰━━━〔 ☠️ 〕━━━⬣
*/

require('dotenv').config()

const settings = {
  botName: "𝘾̷𝙍̷𝙊̷𝙎̷𝙎̷ 𝙈̷𝘿̷ 𝘽̷𝙤̷𝙩̷",
  prefix: ".",
  ownerNumber: process.env.OWNER_NUMBER || "2348063898505",
  ownerName: "༄𝐌𝐑.𝐂𝐑𝐎ss",
  sessionName: "cross-md-session",

  // Media
  thumbnail: "./media/menu.jpg",
  footerText: "🌸 𝘾̷𝙍̷𝙊̷𝙎̷𝙎̷ 𝙈̷𝘿̷ 𝘽̷𝙤̷𝙩̷ | t.me/mr_crosstech",

  // Pairing - Telegram side
  telegramToken: process.env.8729900263:AAFwHtPqn7Rlz3JMXS12eH_fHH5RSLQkuvg, // Add in Render ENV
  telegramOwnerId: process.env.7809173576,  // Your Telegram ID from @userinfobot

  // Links
  telegramChannel: "https://t.me/mr_crosstech",
  telegramGroup: "https://t.me/mr_crosstech",
  github: "https://github.com/cross0079/cross-Md-bot-",

  // GitHub DB - change to yours
  githubToken: process.env.GITHUB_TOKEN || "YOUR_GITHUB_TOKEN",
  githubOwner: "cross0079",
  githubRepo: "cross-Md-bot-",

  // Bot mode: "public" = everyone, "self" = owner+premium only
  mode: "public",

  // Welcome/Left messages
  welcome: {
    enabled: true,
    joinText: [
      "Welcome to the family! 🎉",
      "A new soul has arrived! ✨",
      "The squad just got bigger! 🔥",
      "Fresh face in the building! 👀",
      "New arrival detected! 🚀",
    ],
    leftText: [
      "Another one bites the dust 💨",
      "They couldn't handle us 😤",
      "Farewell traveller 🌙",
      "See you on the other side 👋",
      "Gone but not forgotten 🕊️",
    ],
  },

  // Render keepalive
  port: process.env.PORT || 3000
};

module.exports = settings;
