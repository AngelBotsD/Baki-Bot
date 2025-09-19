import fetch from "node-fetch";
import axios from "axios";

const apis = {
  delirius: "https://delirius-apiofc.vercel.app/",
  ryzen: "https://apidl.asepharyana.cloud/",
  rioo: "https://restapi.apibotwa.biz.id/"
};

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;

  await conn.sendMessage(chatId, {
    react: { text: "🎶", key: msg.key }
  });

  if (!text) {
    return conn.sendMessage(chatId, {
      text: `⚠️ *Debes escribir el nombre de una canción.*\n📌 Ejemplo:\n✳️ \`.play3 Marshmello - Alone\``
    }, { quoted: msg });
  }

  try {
    const res = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=1`);
    const result = res.data.data?.[0];
    if (!result) throw "❌ No se encontraron resultados en Spotify.";

    const { title, artist, duration, url, image } = result;

    const info = `> *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n` +
                 `🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${title}\n` +
                 `🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artist}\n` +
                 `🕒 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}`;

    await conn.sendMessage(chatId, {
      image: { url: image },
      caption: info
    }, { quoted: msg });

    const sendAudio = async (link) => {
      await conn.sendMessage(chatId, {
        audio: { url: link },
        fileName: `${title}.mp3`,
        mimetype: "audio/mpeg"
      }, { quoted: msg });

      await conn.sendMessage(chatId, {
        react: { text: "✅", key: msg.key }
      });
    };

    // 🔹 Ahora primero intenta con RYZEN
    try {
      const r1 = await fetch(`${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(url)}`);
      const j1 = await r1.json();
      return await sendAudio(j1.link);
    } catch (e1) {
      try {
        const r2 = await fetch(`${apis.rioo}api/spotify?url=${encodeURIComponent(url)}`);
        const j2 = await r2.json();
        return await sendAudio(j2.data.response);
      } catch (e2) {
        try {
          const r3 = await fetch(`${apis.delirius}download/spotifydl?url=${encodeURIComponent(url)}`);
          const j3 = await r3.json();
          return await sendAudio(j3.data.url);
        } catch (e3) {
          try {
            const r4 = await fetch(`${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(url)}`);
            const j4 = await r4.json();
            return await sendAudio(j4.data.url);
          } catch (e4) {
            await conn.sendMessage(chatId, {
              text: `❌ *No se pudo descargar el audio.*\n🔹 _Error:_ ${e4.message}`
            }, { quoted: msg });
          }
        }
      }
    }

  } catch (err) {
    console.error("❌ Error en el comando .play3:", err);
    await conn.sendMessage(chatId, {
      text: `❌ *Ocurrió un error:* ${err.message || err}`
    }, { quoted: msg });
  }
};

handler.command = ["play3"];
export default handler;