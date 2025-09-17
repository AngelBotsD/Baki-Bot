import fetch from 'node-fetch'
import axios from 'axios'
import sharp from 'sharp'
import { Buffer } from 'buffer'

const apis = {
  ryzen: 'https://apidl.asepharyana.cloud/',
  delirius: 'https://delirius-apiofc.vercel.app/',
  rioo: 'https://restapi.apibotwa.biz.id/',
}

const handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`⭐ Escribe lo que quieres descargar de *Spotify*\n\nEjemplo: .spotify Chica Paranormal`)
  }

  try {
    // Buscar canción en Delirius
    const { data } = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=10`)
    if (!data.data || data.data.length === 0) {
      throw `❌ No se encontraron resultados para "${text}" en Spotify`
    }

    const song = data.data[0]
    const imgUrl = song.image
    const songUrl = song.url

    // Descargar y redimensionar imagen (igual que play: 480x360)
    const imgRes = await fetch(imgUrl)
    const imgBuffer = await imgRes.arrayBuffer()
    const resizedImg = await sharp(Buffer.from(imgBuffer))
      .resize(480, 360) // igual que en play
      .jpeg()
      .toBuffer()

    // Enviar miniatura con información estilo DOWNLOADER
    await conn.sendMessage(m.chat, {
      image: resizedImg,
      caption: `📥 *𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n` +
               `🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${song.title}\n` +
               `🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${song.artist}\n` +
               `🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${song.duration}`,
    }, { quoted: m })

    // Reacción "procesando"
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const sendAudio = async (downloadUrl) => {
      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${song.title.slice(0, 30)}.mp3`.replace(/[^\w\s.-]/gi, ''),
        ptt: true
      }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

    // Intentar descarga con APIs
    const apiOrder = [
      { name: 'ryzen', url: `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(songUrl)}`, key: 'link' },
      { name: 'delirius v3', url: `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(songUrl)}`, key: 'data.url' },
      { name: 'delirius', url: `${apis.delirius}download/spotifydl?url=${encodeURIComponent(songUrl)}`, key: 'data.url' },
      { name: 'rioo', url: `${apis.rioo}api/spotify?url=${encodeURIComponent(songUrl)}`, key: 'data.response' }
    ]

    let success = false
    for (const api of apiOrder) {
      try {
        const res = await (await fetch(api.url)).json()
        let downloadUrl = res
        for (const k of api.key.split('.')) downloadUrl = downloadUrl[k]
        if (!downloadUrl) throw new Error('No se obtuvo URL de audio')
        await sendAudio(downloadUrl)
        success = true
        break
      } catch (e) {
        console.log(`Error con API ${api.name}:`, e.message)
      }
    }

    if (!success) throw new Error('Todas las APIs fallaron')
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: typeof e === 'string'
        ? e
        : `❌ *Error:* ${e.message || 'Ocurrió un problema'}\n\n` +
          `🔸 *Posibles soluciones:*\n` +
          `• Verifica el nombre de la canción\n` +
          `• Intenta con otro tema\n` +
          `• Prueba más tarde`
    }, { quoted: m })
  }
}

handler.tags = ['downloader']
handler.help = ['spotify']
handler.command = ['spotify']

export default handler