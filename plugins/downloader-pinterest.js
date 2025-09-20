import axios from "axios";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import { fileURLToPath } from "url";

const streamPipeline = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (msg, { conn, text, usedPrefix, command }) => {
  const chatId = msg.key.remoteJid;
  const args = text?.split(" ") || [];
  let qualityArg, url;

  // Verificar si el primer argumento es calidad
  if (args.length > 1 && /^\d+p$/.test(args[0])) {
    qualityArg = args[0];
    url = args[1];
  } else {
    url = args[0];
  }

  if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
    return conn.sendMessage(chatId, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo:\n- *${usedPrefix}${command}* 720p https://youtube.com/watch?v=abc123\n- *${usedPrefix}${command}* https://youtube.com/watch?v=abc123 (automático)`
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

  try {
    // Pedir info al API
    const apiUrl = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(url)}&type=video&apikey=russellxz`;
    const response = await axios.get(apiUrl);
    if (!response.data?.status) throw new Error("No se pudo obtener la información del video");

    const formats = response.data.data; // contiene todas las calidades disponibles
    if (!formats || formats.length === 0) throw new Error("No hay calidades disponibles");

    // Elegir calidad
    let chosen = null;
    if (qualityArg) {
      chosen = formats.find(f => f.quality === qualityArg);
      if (!chosen) throw new Error(`No se encontró la calidad *${qualityArg}* disponible.\nDisponibles: ${formats.map(f => f.quality).join(", ")}`);
    } else {
      // tomar la mejor (la primera suele ser la mayor calidad)
      chosen = formats[0];
    }

    const tmpDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const filePath = path.join(tmpDir, `${Date.now()}_yt.mp4`);

    // Descargar
    const dlRes = await axios.get(chosen.url, { responseType: "stream", headers: { "User-Agent": "Mozilla/5.0" } });
    await streamPipeline(dlRes.data, fs.createWriteStream(filePath));

    const stats = fs.statSync(filePath);
    if (!stats || stats.size < 100000) {
      fs.unlinkSync(filePath);
      throw new Error("El video descargado está vacío o incompleto");
    }

    const caption = `🎬 *YouTube Downloader* 🎬\n\n` +
      `𖠁 *Título:* ${response.data.title}\n` +
      `𖠁 *Duración:* ${response.data.fduration}\n` +
      `𖠁 *Vistas:* ${response.data.views}\n` +
      `𖠁 *Canal:* ${response.data.channel}\n` +
      `𖠁 *Publicado:* ${response.data.publish}\n` +
      `𖠁 *Tamaño:* ${chosen.size || "Desconocido"}\n` +
      `𖠁 *Calidad:* ${chosen.quality}\n` +
      `𖠁 *Link:* https://youtu.be/${response.data.id}\n\n` +
      `⚠️ *¿No se reproduce?* Usa _${usedPrefix}ff_`;

    await conn.sendMessage(chatId, {
      video: fs.readFileSync(filePath),
      mimetype: "video/mp4",
      fileName: `${response.data.title}.mp4`,
      caption
    }, { quoted: msg });

    fs.unlinkSync(filePath);
    await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });

  } catch (err) {
    console.error("❌ Error en ytmp4:", err.message);
    await conn.sendMessage(chatId, { text: `❌ *Error:* ${err.message}` }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
  }
};

handler.command = ["ytmp4"];
export default handler;