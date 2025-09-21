import yts from "yt-search";
import fetch from "node-fetch";

const handler = async (m, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      m.chat,
      { text: `*💽 Ingresa el nombre de alguna canción*` },
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

    // Descargar audio desde tu API
    const apiAudio = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=opus&apikey=soymaycol<3`;
    const r = await fetch(apiAudio);
    const data = await r.json();

    if (!data?.status || !data?.result?.url) {
      throw new Error("No se pudo obtener el audio desde la API");
    }

    const audioBuffer = await fetch(data.result.url).then(res => res.arrayBuffer());
    const buffer = Buffer.from(audioBuffer);

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: "audio/ogg; codecs=opus",
        fileName: `${title}.opus`,
        ptt: false // audio normal
      },
      { quoted: m }
    );

    // React de éxito
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error("Error al descargar audio:", e);
    await conn.sendMessage(
      m.chat,
      { text: "⚠️ Error al descargar el audio. Intenta otra canción." },
      { quoted: m }
    );
  }
};

handler.command = ["play"];
export default handler;