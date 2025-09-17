import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
  delirius: 'https://delirius-apiofc.vercel.app/',
  siputzx: 'https://api.siputzx.my.id/api/',
  ryzen: 'https://apidl.asepharyana.cloud/',
  rioo: 'https://restapi.apibotwa.biz.id/',
  random1: 'https://api.agungny.my.id/api/'
};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) return m.reply(`_*[ ⚠️ ] Agrega lo que quieres Descargar en Spotify*_\n\n_Ejemplo:_\n.play Chica Paranormal.`);

  // Reacción inicial ⏳
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

  try {
    let { data } = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=10`);

    if (!data.data || data.data.length === 0) {
      throw `_*[ ⚠️ ] No se encontraron resultados para "${text}" en Spotify.*_`;
    }

    const track = data.data[0];
    const img = track.image;
    const url = track.url;
    const info = `tu pura madre 
» ${track.title}`.trim();

    // Enviar portada + info antes del audio
    await conn.sendFile(m.chat, img, 'imagen.jpg', info, m);

    // Intentos de descarga
    let downloadUrl = null;
    try {
      const response1 = await fetch(`${apis.delirius}download/spotifydl?url=${encodeURIComponent(url)}`);
      const result1 = await response1.json();
      downloadUrl = result1.data.url;
    } catch (e1) {
      try {
        const response2 = await fetch(`${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(url)}`);
        const result2 = await response2.json();
        downloadUrl = result2.data.url;
      } catch (e2) {
        try {
          const response3 = await fetch(`${apis.rioo}api/spotify?url=${encodeURIComponent(url)}`);
          const result3 = await response3.json();
          downloadUrl = result3.data.response;
        } catch (e3) {
          try {
            const response4 = await fetch(`${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(url)}`);
            const result4 = await response4.json();
            downloadUrl = result4.link;
          } catch (e4) {
            return m.reply(`❌ Ocurrió un error al descargar el audio\nError:${e4.message}`);
          }
        }
      }
    }

    // Enviar audio como nota de voz (PTT)
    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      ptt: true  // 👈 aquí está la clave para que se vea como en tu screenshot
    }, { quoted: m });

    // ✅ cuando ya se manda el audio
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    await conn.reply(m.chat, `> Intenta Nuevamente.`, m);
    console.log(e);
  }
};

handler.tags = ['downloader'];
handler.help = ['spotify'];
handler.command = ['spotify'];
export default handler;