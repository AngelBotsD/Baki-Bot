import fetch from 'node-fetch';
import axios from 'axios';
import sharp from 'sharp';
import { Buffer } from 'buffer';

const apis = {
  ryzen: 'https://apidl.asepharyana.cloud/',
  delirius: 'https://delirius-apiofc.vercel.app/',
  rioo: 'https://restapi.apibotwa.biz.id/',
};

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`⭐ Escribe el nombre de la canción\n\nEjemplo: .spotify Chica Paranormal`);

  try {
    // 1. Buscar en Spotify
    const { data } = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=5`);
    if (!data.data || data.data.length === 0) throw `❌ No se encontraron resultados para "${text}"`;

    const song = data.data[0];
    const imgUrl = song.image;
    const songUrl = song.url;

    const info = `*𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n` +
                 `🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${song.title}\n` +
                 `🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${song.artist}\n` +
                 `🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${song.duration}`;

    // 2. Redimensionar portada
    const imgRes = await fetch(imgUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const resizedImg = await sharp(Buffer.from(imgBuffer)).resize(480, 360).jpeg().toBuffer();

    await conn.sendMessage(m.chat, { image: resizedImg, caption: info }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // 3. Intentar descargar
    const apiOrder = [
      { name: 'ryzen', url: `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(songUrl)}`, key: 'link' },
      { name: 'delirius v3', url: `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(songUrl)}`, key: 'data.url' },
      { name: 'delirius', url: `${apis.delirius}download/spotifydl?url=${encodeURIComponent(songUrl)}`, key: 'data.url' },
      { name: 'rioo', url: `${apis.rioo}api/spotify?url=${encodeURIComponent(songUrl)}`, key: 'data.response' }
    ];

    let success = false;
    for (const api of apiOrder) {
      try {
        const res = await (await fetch(api.url)).json();
        let downloadUrl = res;
        for (const k of api.key.split('.')) downloadUrl = downloadUrl?.[k];
        if (!downloadUrl) throw new Error('No se obtuvo URL de audio');

        await conn.sendMessage(
          m.chat,
          { audio: { url: downloadUrl }, mimetype: 'audio/mpeg', ptt: true },
          { quoted: m }
        );
        success = true;
        break;
      } catch (e) {
        console.log(`Error con API ${api.name}:`, e.message);
      }
    }

    if (!success) throw new Error('Todas las APIs fallaron');

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await m.reply(`❌ *Error:* ${e.message || e}\n\n🔸 *Posibles soluciones:*\n• Verifica el nombre\n• Intenta con otro tema\n• Prueba más tarde`);
  }
};

handler.help = ['spotify'];
handler.tags = ['downloader'];
handler.command = ['spotify'];

export default handler;