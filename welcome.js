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
┃ https://github.com/cross0079/cross-Md-bot-
╰━━━〔 ☠️ 〕━━━⬣
*/
/**
 * welcome.js
 * Generates welcome/left image:
 * - background: media/menu.jpg
 * - two round profile circles (user + group) side by side
 * - styled text overlay
 * Uses only built-in Node.js + canvas (npm: canvas)
 */

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const MENU_IMG = path.resolve("./media/menu.jpg");
const W = 800;
const H = 400;
const AVATAR_SIZE = 150;

/**
 * Fetch profile picture buffer, fallback to placeholder circle
 */
async function getProfilePic(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    return buf;
  } catch {
    return null;
  }
}

/**
 * Draw a circular clipped image on canvas
 */
function drawCircle(ctx, img, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

/**
 * Draw a placeholder circle with initials when no profile pic
 */
function drawPlaceholder(ctx, label, x, y, size, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.4}px Sans`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.charAt(0).toUpperCase(), x + size / 2, y + size / 2);
  ctx.restore();
}

/**
 * Build the welcome/left image
 * @param {object} sock - WA socket
 * @param {string} userJid - user's JID
 * @param {string} groupJid - group JID
 * @param {string} type - "join" | "left"
 * @param {string} userName - display name
 * @param {string} groupName - group name
 * @returns {Buffer} PNG buffer
 */
async function buildWelcomeImage(sock, userJid, groupJid, type, userName, groupName) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // ── Background ──
  if (fs.existsSync(MENU_IMG)) {
    const bg = await loadImage(MENU_IMG);
    ctx.drawImage(bg, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, W, H);
  }

  // ── Dark overlay for readability ──
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, W, H);

  // ── Fetch profile pics ──
  const [userBuf, groupBuf] = await Promise.all([
    getProfilePic(sock, userJid),
    getProfilePic(sock, groupJid),
  ]);

  const userAvatarX = W / 2 - AVATAR_SIZE - 40;
  const groupAvatarX = W / 2 + 40;
  const avatarY = H / 2 - AVATAR_SIZE / 2 - 30;

  // ── Draw user avatar ──
  if (userBuf) {
    const userImg = await loadImage(userBuf);
    ctx.save();
    ctx.beginPath();
    ctx.arc(userAvatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE / 2, AVATAR_SIZE / 2 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = type === "join" ? "#00e676" : "#ff5252";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    drawCircle(ctx, userImg, userAvatarX, avatarY, AVATAR_SIZE);
  } else {
    drawPlaceholder(ctx, userName, userAvatarX, avatarY, AVATAR_SIZE, "#6C0BA9");
  }

  // ── Draw group avatar ──
  if (groupBuf) {
    const groupImg = await loadImage(groupBuf);
    ctx.save();
    ctx.beginPath();
    ctx.arc(groupAvatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE / 2, AVATAR_SIZE / 2 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    drawCircle(ctx, groupImg, groupAvatarX, avatarY, AVATAR_SIZE);
  } else {
    drawPlaceholder(ctx, groupName, groupAvatarX, avatarY, AVATAR_SIZE, "#1565c0");
  }

  // ── Labels under avatars ──
  ctx.font = "bold 18px Sans";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(userName.length > 14 ? userName.slice(0, 14) + "…" : userName, userAvatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE + 22);
  ctx.fillText(groupName.length > 14 ? groupName.slice(0, 14) + "…" : groupName, groupAvatarX + AVATAR_SIZE / 2, avatarY + AVATAR_SIZE + 22);

  // ── "New User" / "Good-bye" label ──
  const badge = type === "join" ? "New User 🌟" : "Good-bye 👋";
  const badgeColor = type === "join" ? "#00e676" : "#ff5252";
  ctx.font = "bold 32px Sans";
  ctx.textAlign = "center";
  ctx.fillStyle = badgeColor;
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 10;
  ctx.fillText(badge, W / 2, avatarY + AVATAR_SIZE + 60);

  // ── Small footer ── Changed Anime MD → CROSS MD
  ctx.font = "16px Sans";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.shadowBlur = 0;
  ctx.fillText("🌸 CROSS MD", W / 2, H - 18);

  return canvas.toBuffer("image/png");
}

module.exports = { buildWelcomeImage };
