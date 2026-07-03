const axios = require('axios');
const fetch = require('node-fetch');
const { OWNER, CREDIT } = require('./config'); // or hardcode if you don’t have config.js

module.exports = async function ai(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;

        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `*CROSS AI* 🤖\n\nUse:.gpt or.gemini + your question\nExample:.gpt write html code`
            }, { quoted: message });
        }

        const parts = text.split(' ');
        const command = parts[0].toLowerCase();
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `*CROSS AI* 🤖\n\nPlease add a question after ${command}`
            }, { quoted: message });
        }

        // React while processing
        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        if (command === '.gpt') {
            const res = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(query)}`);
            if (res.data?.success && res.data?.result) {
                const answer = `${res.data.result.prompt}\n\n*Powered by: CROSS MD* ☠️`;
                return await sock.sendMessage(chatId, { text: answer }, { quoted: message });
            }
            throw new Error('Invalid GPT response');
        }

        if (command === '.gemini') {
            const apis = [
                `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                `https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`
            ];

            for (const api of apis) {
                try {
                    const res = await fetch(api);
                    const data = await res.json();
                    const answer = data.message || data.data || data.answer || data.result;
                    if (answer) {
                        return await sock.sendMessage(chatId, {
                            text: `${answer}\n\n*Powered by: CROSS MD* ☠️`
                        }, { quoted: message });
                    }
                } catch (e) { continue; }
            }
            throw new Error('All Gemini APIs failed');
        }

    } catch (error) {
        console.error('CROSS AI Error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *CROSS AI Error*\nAll AI APIs failed. Try again later.\n\n*Owner: ${OWNER || '༄𝐌𝐑.𝐂𝐑𝐎𝐒'}*`,
            contextInfo: { mentionedJid: [message.key.participant || message.key.remoteJid] }
        }, { quoted: message });
    }
}
