import yts from "yt-search";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import os from "os";

const TMP_DIR = os.tmpdir();

const handler = async (m, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      m.chat,
      { text: "*💽 Ingresa el nombre de alguna canción*" },
      { quoted: m }
    );
  }

  // React de "buscando"
  await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

  try {
    const res = await yts(text);
    if (!res?.videos?.length) {
      return conn.sendMessage(
        m.chat,
        { text: "❌ No se encontró ningún video con ese nombre." },
        { quoted: m }
      );
    }

    const video = res.videos[0];
    const { url: videoUrl, title, author, timestamp: duration, thumbnail } = video;
    const artista = author?.name || "Desconocido";

    // Enviar info del video
    const infoMsg = `
> *🎬 YouTube Downloader*

🎵 *Título:* ${title}
🎤 *Artista:* ${artista}
🕑 *Duración:* ${duration}
    `.trim();

    await conn.sendMessage(
      m.chat,
      { image: { url: thumbnail }, caption: infoMsg },
      { quoted: m }
    );

    // --- Intentar descargar OPUS desde la API ---
    try {
      const apiOpus = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=opus&apikey=soymaycol<3`;
      const resOpus = await fetch(apiOpus, { redirect: "follow" });
      const dataOpus = await resOpus.json().catch(() => null);

      if (dataOpus?.status && dataOpus.result?.url) {
        const buf = await fetch(dataOpus.result.url).then(r => r.buffer());
        await conn.sendMessage(
          m.chat,
          {
            audio: buf,
            mimetype: "audio/ogg; codecs=opus",
            fileName: cleanName(title) + ".opus",
            ptt: false
          },
          { quoted: m }
        );
        await m.react("✅");
        return;
      }
    } catch (e) {
      console.warn("Fallo al obtener OPUS directo:", e.message);
    }

    // --- Fallback a MP3 si Opus falla ---
    try {
      const apiMp3 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&apikey=soymaycol<3`;
      const resMp3 = await fetch(apiMp3, { redirect: "follow" });
      const dataMp3 = await resMp3.json();

      if (!dataMp3?.status || !dataMp3?.result?.url) {
        throw new Error("API no devolvió MP3");
      }

      const mp3Buffer = await fetch(dataMp3.result.url).then(r => r.buffer());
      await conn.sendMessage(
        m.chat,
        {
          audio: mp3Buffer,
          mimetype: "audio/mpeg",
          fileName: cleanName(title) + ".mp3",
          ptt: false
        },
        { quoted: m }
      );
      await m.react("✅");
      return;
    } catch (err) {
      console.error("Fallo fallback MP3:", err.message);
      await conn.sendMessage(
        m.chat,
        { text: "⚠️ Error al descargar el audio. Intenta otra canción." },
        { quoted: m }
      );
      await m.react("💔");
      return;
    }
  } catch (error) {
    console.error("Error general:", error);
    await conn.sendMessage(
      m.chat,
      { text: "⚠️ Error al procesar la búsqueda. Intenta otra canción." },
      { quoted: m }
    );
    await m.react("💔");
  }
};

// --- Helpers ---
function cleanName(name) {
  return name.replace(/[^\w\s-_.]/gi, "").substring(0, 50).trim();
}

handler.command = ["play"];
export default handler;