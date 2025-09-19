import fetch from "node-fetch";
import yts from "yt-search";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const APIS = [
  {
    name: "neoxr",
    url: (videoUrl) => `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`,
    extract: (data) => data?.data?.url
  }
];

const getAudioUrl = async (videoUrl) => {
  let lastError = null;
  for (const api of APIS) {
    try {
      const res = await fetch(api.url(videoUrl), { timeout: 15000 });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const audioUrl = api.extract(data);
      if (audioUrl) return audioUrl;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Todas las APIs fallaron");
};

const convertToWhatsAppPtt = (input, output) => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", input,
      "-vn",
      "-ar", "16000",
      "-ac", "1",
      "-c:a", "libopus",
      "-b:a", "64k",
      "-f", "ogg",
      output
    ]);
    ffmpeg.stderr.on("data", () => {});
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error("Error al convertir a WhatsApp PTT"));
    });
  });
};

let handler = async (m, { conn }) => {
  const body = m.text?.trim();
  if (!body) return;
  if (!/^play|.play\s+/i.test(body)) return;
  const query = body.replace(/^(play|.play)\s+/i, "").trim();
  if (!query) throw `⭐ Escribe el nombre de la canción\n\nEjemplo: play Bad Bunny - Monaco`;

  const tmpMp3 = path.join(process.cwd(), `${Date.now()}-in`);
  const tmpOgg = path.join(process.cwd(), `${Date.now()}-out.ogg`);

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    const searchResults = await yts({ query, hl: "es", gl: "ES" });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");
    if (video.seconds > 600) throw "❌ El audio es muy largo (máximo 10 minutos)";

    const minutes = Math.floor(video.seconds / 60);
    const seconds = video.seconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: `> *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n🎵 *Título:* ${video.title}\n🎤 *Artista:* ${video.author.name || "Desconocido"}\n🕑 *Duración:* ${durationFormatted}`
    }, { quoted: m });

    const audioUrl = await getAudioUrl(video.url);

    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error(`Error al descargar audio: HTTP ${res.status}`);

    const fileStream = fs.createWriteStream(tmpMp3);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      fileStream.on("finish", resolve);
    });

    await convertToWhatsAppPtt(tmpMp3, tmpOgg);

    const oggData = fs.readFileSync(tmpOgg);
    await conn.sendMessage(m.chat, {
      audio: oggData,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    const errorMsg = typeof error === "string" ? error : `❌ *Error:* ${error.message || "Ocurrió un problema"}`;
    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  } finally {
    try { if (fs.existsSync(tmpMp3)) fs.unlinkSync(tmpMp3); } catch(e){}
    try { if (fs.existsSync(tmpOgg)) fs.unlinkSync(tmpOgg); } catch(e){}
  }
};

handler.customPrefix = /^(play|.play)\s+/i;
handler.command = new RegExp;
handler.exp = 0;

export default handler;