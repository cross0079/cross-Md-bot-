require('dotenv').config()
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys')
const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const pino = require('pino')
const chalk = require('chalk')

// ==== CONFIG FROM RENDER ENV VARS ====
const TG_TOKEN = process.env.TELEGRAM_TOKEN // add this in Render
const OWNER = '༄𝐌𝐑.𝐂𝐑𝐎𝐒'
const CREDIT = '𝐌𝐑.𝐂𝐑𝐎𝐒𝐓𝐄𝐂𝐇' 
const PORT = process.env.PORT || 3000

const BANNER = `
╭━━━〔 CROSS 〕━━━⬣
┃『CROSS〆 𝘾̷𝙍̷𝙊̷𝙎̷𝙎̷ 𝙈̷𝘿̷ 𝘽̷𝙤̷𝙩̷ ☠️』
┣━━━━━━━━⬣
┃『Owner : ${mr cross』
┃『Credit: $mr cross tech』
╰━━━〔 ☠️ 〕━━━⬣
`
console.log(chalk.magenta(BANNER))

// ==== KEEP RENDER ALIVE ====
const app = express()
app.get('/', (req,res) => res.send('CROSS MD is running'))
app.listen(PORT, () => console.log(chalk.green(`Web: ${PORT}`)))

// ==== TELEGRAM BOT ====
const bot = new TelegramBot(TG_TOKEN, { polling: true })
let sockGlobal = null

bot.onText(/\/pair (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const number = match[1].replace(/[^0-9]/g, '')
  
  if(!sockGlobal) return bot.sendMessage(chatId, 'Bot is restarting... wait 5s and try again')
  
  try {
    const code = await sockGlobal.requestPairingCode(number)
    bot.sendMessage(chatId, `*CROSS MD Pair Code*\n\nNumber: +${number}\nCode: \`\`${code}\`\n\nEnter this on WhatsApp > Link a Device`, { parse_mode: 'Markdown' })
  } catch(e) {
    bot.sendMessage(chatId, `Error: ${e.message}`)
  }
})

bot.on('message', (msg) => {
  if(msg.text === '/start') {
    bot.sendMessage(msg.chat.id, `*CROSS MD Telegram Pairing*\n\nUse: /pair 2348xxxxxxx\nOwner: ${OWNER}`, { parse_mode: 'Markdown' })
  }
})

// ==== WHATSAPP BOT ====
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: Browsers.macOS('CROSS MD'),
        printQRInTerminal: false // we use pairing now
    })
    sockGlobal = sock

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log(chalk.green('✅ CROSS MD WhatsApp Connected'))
            bot.sendMessage(process.env.TG_OWNER_ID, '✅ CROSS MD is Online on WhatsApp') // optional
        }
    })
}
startBot()
