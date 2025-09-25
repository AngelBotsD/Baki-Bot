import fetch from "node-fetch";
import yts from "yt-search";

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim()) {
      return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m);
    }

    await m.react("🕒");

    // 🔎 Buscar en YouTube si no es link
    let videoUrl = text;
    if (!/youtu\.be|youtube\.com/.test(text)) {
      let search = await yts(text);
      if (!search.videos.length) throw "⚠️ No encontré resultados.";
      videoUrl = search.videos[0].url;
    }

    // 🔧 Helper para normalizar respuesta API
    const tryApi = async (name, url) => {
      const res = await fetch(url, { timeout: 25000 }).catch(() => null);
      if (!res || !res.ok) throw new Error(`${name} no respondió`);
      const data = await res.json();

      if (data?.result?.url) return data.result.url;
      if (data?.data?.url) return data.data.url;
      if (data?.result?.download_url) return data.result.download_url;
      if (data?.url) return data.url;

      throw new Error(`${name} sin URL válida`);
    };

    // 🌐 Todas las APIs en paralelo
    const apis = [
      tryApi("MayAPI", `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&apikey=may-0595dca2`),
      tryApi("NeoxR", `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&apikey=russellxz`),
      tryApi("AdonixAPI", `https://api-adonix.ultraplus.click/download/ytmp4?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`),
      tryApi("Adofreekey", `https://api-adonix.ultraplus.click/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}`)
    ];

    // 🚀 Competencia: la primera API válida gana
    const dlUrl = await Promise.any(apis);

    if (!dlUrl) throw "⚠️ No se pudo descargar el video desde ninguna API.";

    // 📤 Enviar video
    await conn.sendMessage(
      m.chat,
      {
        video: { url: dlUrl },
        mimetype: "video/mp4",
        caption: `✅ Aquí está tu video:\n${videoUrl}`,
      },
      { quoted: m }
    );

    await m.react("✅");
  } catch (e) {
    console.error(e);
    await m.react("❌");
    conn.reply(m.chat, `⚠️ Error en .${command}: ${e.message}`, m);
  }
};

handler.help = ["play2"];
handler.tags = ["downloader"];
handler.command = ["play2"];

export default handler;