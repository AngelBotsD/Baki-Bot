import fetch from "node-fetch";
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m);

    await m.react('🕒');

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text;

    const search = await yts(query);
    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0];
    if (!result) throw 'ꕥ No se encontraron resultados.';

    const { title, seconds, views, url, thumbnail, author } = result;
    if (seconds > 1620) throw '⚠ El video supera el límite de duración (27 minutos).';

    const duracion = formatDuration(seconds);
    const artista = author?.name || 'Desconocido';
    const calidad = '1080p'; // fijo como en tu ejemplo
    const apiUsed = 'MyAPI';

    const info = `> *𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

⭒ ִֶָ७ ꯭🎵˙⋆｡ - *𝚃𝚒́𝚝𝚞𝚕𝚘:* ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - *𝙳𝚞𝚛𝚊𝚌𝚒́𝚘́𝚗:* ${duracion}
⭒ ִֶָ७ ꯭📺˙⋆｡ - *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* ${calidad}
⭒ ִֶָ७ ꯭🌐˙⋆｡ - *𝙰𝚙𝚒:* ${apiUsed}

*» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧*
*» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...*

*⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻*

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 ba.𝗑𝗒𝗓\`\`\``;

    // enviar info
    await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m });

    // descargar audio
    const audioUrl = await getYtmp3(url);
    if (!audioUrl) throw '⚠ No se pudo obtener el audio.';

    await conn.sendMessage(m.chat, { audio: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    await m.react('✖️');
    return conn.reply(m.chat, typeof e === 'string' ? e : '⚠ Se produjo un error.\n' + e.message, m);
  }
};

handler.command = handler.help = ['l'];
handler.tags = ['descargas'];
handler.group = true;

export default handler;

async function getYtmp3(url) {
  try {
    const endpoint = `https://api-adonix.ultraplus.click/download/ytmp3?apikey=may-0595dca2&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint).then(r => r.json());
    if (!res?.data?.url) return null;
    return res.data.url;
  } catch {
    return null;
  }
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}