import axios from "axios";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";

const streamPipe = promisify(pipeline);

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: `*💽 𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝙴𝚕 𝙽𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚊𝚕𝚐𝚞𝚗𝚊 𝙲𝚊𝚗𝚌𝚒𝚘𝚗*` },
      { quoted: msg }
    );
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  });

  const res = await yts(text);
  const video = res.videos[0];
  if (!video) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    );
  }

  const { url: videoUrl, title, timestamp: duration, author, thumbnail } = video;
  const artista = author.name;

  try {
    const infoMsg = `
> *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${title}
🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}
`.trim();

    await conn.sendMessage(
      msg.key.remoteJid,
      { image: { url: thumbnail }, caption: infoMsg },
      { quoted: msg }
    );

    // Endpoint de la API para audio
    const endpoint = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=may-0595dca2`;
    const r = await axios.get(endpoint);

    if (!r.data?.url) throw new Error("No se pudo obtener el audio");

    const tmp = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

    const outFile = path.join(tmp, `${Date.now()}_${title}.mp3`);

    const dl = await axios.get(r.data.url, { responseType: "stream" });
    await streamPipe(dl.data, fs.createWriteStream(outFile));

    const buffer = fs.readFileSync(outFile);

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        ptt: false
      },
      { quoted: msg }
    );

    fs.unlinkSync(outFile);

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: "✅", key: msg.key }
    });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(
      msg.key.remoteJid,
      { text: "⚠️ Error al descargar el audio." },
      { quoted: msg }
    );
  }
};

handler.command = ["play"];

export default handler;