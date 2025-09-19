import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
  delirius: 'https://delirius-apiofc.vercel.app/',
  ryzen: 'https://apidl.asepharyana.cloud/',
  rioo: 'https://restapi.apibotwa.biz.id/'
};

const handler = async (m, { conn, command, args, text, usedPrefix }) => {

  if (!text) return m.reply(`_*[ ⚠️ ] Agrega lo que quieres Descargar en Spotify*_\n\n_Ejemplo:_\n.play Chica Paranormal.`);

  try {
    // Usar primero ryzen
    let { data } = await axios.get(`${apis.ryzen}api/search/spotify?query=${encodeURIComponent(text)}&limit=10`);

    if (!data.data || data.data.length === 0) {
      throw `_*[ ⚠️ ] No se encontraron resultados para "${text}" en Spotify.*_`;
    }

    const song = data.data[0];
    const img = song.image;
    const url = song.url;

    // Mensaje bonito
    const info = `> *𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${song.title}\n🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${song.artist}\n🕒 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${song.duration}\n\n_*🎶 Enviando música...*_`;

    await conn.sendFile(m.chat, img, 'imagen.jpg', info, m);

    //＼／＼／＼／＼／＼／ DESCARGAR ＼／＼／＼／＼／＼／
    try {
      const api1 = `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(url)}`;
      const response1 = await fetch(api1);
      const result1 = await response1.json();

      const downloadUrl1 = result1.link;
      await conn.sendMessage(m.chat, { audio: { url: downloadUrl1 }, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: null, quoted: m });

    } catch (e1) {
      try {
        const api2 = `${apis.delirius}download/spotifydl?url=${encodeURIComponent(url)}`;
        const response2 = await fetch(api2);
        const result2 = await response2.json();

        const downloadUrl2 = result2.data.url;
        await conn.sendMessage(m.chat, { audio: { url: downloadUrl2 }, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: null, quoted: m });

      } catch (e2) {
        try {
          const api3 = `${apis.rioo}api/spotify?url=${encodeURIComponent(url)}`;
          const response3 = await fetch(api3);
          const result3 = await response3.json();

          const downloadUrl3 = result3.data.response;
          await conn.sendMessage(m.chat, { audio: { url: downloadUrl3 }, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: null, quoted: m });

        } catch (e3) {
          m.reply(`❌ Ocurrió un error al descargar el audio\nError:${e3.message}`);
        }
      }
    }

  } catch (e) {
    await conn.reply(m.chat, `> Intenta Nuevamente.`, m);
    console.log(e);
  }
};

handler.tags = ['downloader']; 
handler.help = ['spotify'];
handler.command = ['spotify'];
export default handler;