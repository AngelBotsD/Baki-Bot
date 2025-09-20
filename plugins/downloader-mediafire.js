import fetch from "node-fetch";

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ");
  const pref = global.prefixes?.[0] || ".";

  if (!text) {
    return conn.sendMessage(chatId, {
      text: `⚠️ *Uso incorrecto del comando.*\n\n📌 *Ejemplo:* ${pref}${command} aguila blanca`
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: '⏳', key: msg.key }
  });

  try {
    // 🔍 Buscar canción por texto
    const apiUrl = `https://api.neoxr.eu/api/spotify-search?query=${encodeURIComponent(text)}&apikey=russellxz`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const data = await response.json();
    if (!data.status || !data.data || !data.data[0]) throw new Error("No se encontraron resultados.");

    // Tomar el primer resultado
    const song = data.data[0];

    const caption =
      `𖠁 *Título:* ${song.title}\n` +
      `𖠁 *Artista:* ${song.artist.name}\n` +
      `𖠁 *Duración:* ${song.duration}\n` +
      `𖠁 *Enlace:* ${song.url}\n\n────────────\n🎧 _La Suki Bot_`;

    // 📸 Miniatura con información
    await conn.sendMessage(chatId, {
      image: { url: song.thumbnail },
      caption,
      mimetype: "image/jpeg"
    }, { quoted: msg });

    // 🎵 Descargar audio
    const audioRes = await fetch(song.url);
    if (!audioRes.ok) throw new Error("No se pudo descargar el audio.");

    const audioBuffer = await audioRes.buffer();
    await conn.sendMessage(chatId, {
      audio: audioBuffer,
      mimetype: "audio/mpeg",
      fileName: `${song.title}.mp3`
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en .spotify:", err);
    await conn.sendMessage(chatId, {
      text: `❌ *Error al buscar Spotify:*\n_${err.message}_`
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    });
  }
};

handler.command = ["splay"];
export default handler;