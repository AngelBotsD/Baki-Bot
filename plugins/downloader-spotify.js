import fetch from 'node-fetch';
import axios from 'axios';
import sharp from 'sharp';
import { Buffer } from 'buffer';

const apis = {
  delirius: 'https://delirius-apiofc.vercel.app/',
  siputzx: 'https://api.siputzx.my.id/api/',
  ryzen: 'https://apidl.asepharyana.cloud/',
  rioo: 'https://restapi.apibotwa.biz.id/',
  random1: 'https://api.agungny.my.id/api/'
};

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`⚠️ Escribe lo que quieres buscar en Spotify\n\nEjemplo: .spotify Chica Paranormal`);

  try {
    // 1. Buscar en Spotify
    let { data } = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=5`);
    if (!data.data || data.data.length === 0) throw `❌ No se encontraron resultados para "${text}" en Spotify`;

    const song = data.data[0];
    const imgUrl = song.image;
    const songUrl = song.url;

    // 2. Redimensionar portada al estilo del .play
    const imgRes = await fetch(imgUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const resizedImg = await sharp(Buffer.from(imgBuffer)).resize(480, 360).jpeg().toBuffer();

    // 3. Info estilo "SPOTIFY DOWNLOADER"
    const info = `*SPOTIFY DOWNLOADER*\n\n` +
                 `🎵 *Titulo:* ${song.title}\n` +
                 `🎤 *Artista:* ${song.artist}\n` +
                 `🕒 *Duración:* ${song.duration}`;

    await conn.sendMessage(m.chat, { image: resizedImg, caption: info }, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key } });

    // 4. Descargar con cascada de APIs
    const apiOrder = [
      { name: 'delirius', url: `${apis.delirius}download/spotifydl?url=${encodeURIComponent(songUrl)}`, key: 'data.url' },
      { name: 'delirius v3', url: `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(songUrl)}`, key: 'data.url' },
      { name: 'rioo', url: `${apis.rioo}api/spotify?url=${encodeURIComponent(songUrl)}`, key: 'data.response' },
      { name: 'ryzen', url: `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(songUrl)}`, key: 'link' }
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
          { audio: { url: downloadUrl }, mimetype: 'audio/mpeg', fileName: `${song.title}.mp3` },
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

handler.tags = ['downloader'];
handler.help = ['spotify'];
handler.command = ['spotify'];

export default handler;