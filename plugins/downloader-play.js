import axios from "axios";
import yts from "yt-search";

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "🎶 Ingresa el nombre de alguna canción" },
      { quoted: msg }
    );
  }

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "🕒", key: msg.key } });

  const res = await yts({ query: text, hl: "es", gl: "MX" });
  const song = res.videos[0];
  if (!song) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    );
  }

  const { url: videoUrl, title, timestamp: duration, author, thumbnail } = song;
  const artista = author.name;

  const tryDownload = async (apis) => {
    return new Promise((resolve, reject) => {
      let settled = false;
      let errors = [];

      apis.forEach(p => {
        p().then(result => {
          if (!settled) {
            settled = true;
            resolve(result);
          }
        }).catch(err => {
          errors.push(err);
          if (errors.length === apis.length && !settled) {
            reject(new Error("No se pudo obtener el audio de ninguna API"));
          }
        });
      });
    });
  };

  const apis = [
    () => axios.get(`https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&apikey=may-0595dca2`, { timeout: 9000 }).then(r => ({ url: r.data?.result?.url || r.data?.data?.url, api: "Api 1M" })),
    () => axios.get(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`, { timeout: 9000 }).then(r => ({ url: r.data?.result?.url || r.data?.data?.url, api: "Api 2A" })),
    () => axios.get(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}`, { timeout: 9000 }).then(r => ({ url: r.data?.result?.url || r.data?.data?.url, api: "Api 3F" }))
  ];

  try {
    const winner = await tryDownload(apis);
    const audioDownloadUrl = winner.url;

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: thumbnail },
        caption: `
⭒ ִֶָ७ ꯭🎵˙⋆｡ - Título: ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - Artista: ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - Duración: ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - Calidad: 128kbps
⭒ ִֶָ७ ꯭🌐˙⋆｡ - API: ${winner.api}

» ENVIANDO AUDIO 🎧
» AGUÁRDALE UN POCO...
`.trim()
      },
      { quoted: msg }
    );

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        audio: { url: audioDownloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${title.replace(/[^\w\s.-]/gi, '')}.mp3`,
        ptt: false
      },
      { quoted: msg }
    );

    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

  } catch (e) {
    await conn.sendMessage(
      msg.key.remoteJid,
      { text: `❌ *Error:* ${e.message || "Ocurrió un problema"}\n\n🔸 Posibles soluciones:\n• Verifica el nombre de la canción\n• Intenta con otro tema\n• Prueba más tarde` },
      { quoted: msg }
    );
  }
};

handler.command = ["play"];
export default handler;