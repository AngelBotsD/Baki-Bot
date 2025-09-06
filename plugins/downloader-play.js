import fetch from "node-fetch";
import yts from "yt-search";

const APIS_VIDEO = [
  {
    name: "vreden",
    url: (videoUrl) => `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=360`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "zenkey",
    url: (videoUrl) => `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${encodeURIComponent(videoUrl)}&quality=360`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "yt1s",
    url: (videoUrl) => `https://yt1s.io/api/ajaxSearch?q=${encodeURIComponent(videoUrl)}`,
    extract: async (data) => {
      const k = data?.links?.mp4?.auto?.k;
      return k ? `https://yt1s.io/api/ajaxConvert?vid=${data.vid}&k=${k}&quality=360` : null;
    }
  }
];

// Función para obtener la URL del video usando APIs
const getVideoUrl = async (videoUrl) => {
  let lastError = null;

  for (const api of APIS_VIDEO) {
    try {
      console.log(`Probando API: ${api.name}`);
      const apiUrl = api.url(videoUrl);
      const response = await fetch(apiUrl, { timeout: 5000 });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const videoUrlFinal = await api.extract(data);

      if (videoUrlFinal) {
        console.log(`Éxito con API: ${api.name}`);
        return videoUrlFinal;
      }
    } catch (error) {
      console.error(`Error con API ${api.name}:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error("Todas las APIs fallaron");
};

// Función para descargar y enviar video como buffer
const sendVideoFromUrl = async (conn, chatId, videoUrl, fileName, quoted) => {
  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error("No se pudo descargar el video");
  const buffer = await res.arrayBuffer();

  await conn.sendMessage(chatId, {
    video: { buffer: Buffer.from(buffer) },
    mimetype: "video/mp4",
    fileName,
    caption: `🎬 ${fileName}`
  }, { quoted });
};

// Handler principal
let handler = async (m, { conn }) => {
  const body = m.text?.trim();
  if (!body) return;
  if (!/^play2|.play2\s+/i.test(body)) return;

  const query = body.replace(/^(play2|.play2)\s+/i, "").trim();
  if (!query) throw `⭐ Escribe el nombre del video\n\nEjemplo: play2 Bad Bunny - Monaco`;

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    const searchResults = await yts({ query, hl: 'es', gl: 'ES' });
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontró el video");

    if (video.seconds > 1800) throw "❌ El video es muy largo (máximo 30 minutos)";

    // Enviar miniatura con título
    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: `*_${video.title}_*\n\n> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂 💻`
    }, { quoted: m });

    // Obtener URL del video
    let videoUrlFinal;
    try {
      videoUrlFinal = await getVideoUrl(video.url);
    } catch (e) {
      console.error("Error al obtener video:", e);
      throw "⚠️ Error al procesar el video. Intenta con otro";
    }

    // Descargar y enviar video
    await sendVideoFromUrl(conn, m.chat, videoUrlFinal, `${video.title.slice(0, 30)}.mp4`.replace(/[^\w\s.-]/gi, ''), m);

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });

    const errorMsg = typeof error === 'string' ? error :
      `❌ *Error:* ${error.message || 'Ocurrió un problema'}\n\n` +
      `🔸 *Posibles soluciones:*\n` +
      `• Verifica el nombre del video\n` +
      `• Intenta con otro tema\n` +
      `• Prueba más tarde`;

    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
  }
};

handler.customPrefix = /^(play2|.play2)\s+/i;
handler.command = new RegExp;
handler.exp = 0;

export default handler;