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
    return m.reply(`_*[ ⚠️ ] Agrega lo que quieres descargar en Spotify*_\n\n_Ejemplo:_\n.play Chica Paranormal.`)
  }

  try {
    // Buscar canción en Delirius (para info de título, artista y duración)
    const { data } = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=10`)
    if (!data.data || data.data.length === 0) {
      throw `_*[ ⚠️ ] No se encontraron resultados para "${text}" en Spotify.*_`
    }

    const song = data.data[0]
    const imgUrl = song.image
    const songUrl = song.url

    const info =
      `📥 *𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n` +
      `🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${song.title}\n` +
      `🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${song.artist}\n` +
      `🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${song.duration}\n\n`

    // Descargar imagen de Spotify y redimensionar
    const imgRes = await fetch(imgUrl)
    const imgBuffer = await imgRes.arrayBuffer()
    const resizedImg = await sharp(Buffer.from(imgBuffer))
      .resize(480, 360) // mismo tamaño que miniatura de play
      .jpeg()
      .toBuffer()

    // Enviar imagen redimensionada con info
    await conn.sendMessage(m.chat, { image: resizedImg, caption: info }, { quoted: m })

    // Reacción de "procesando"
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // Función para enviar el audio
    const sendAudio = async (downloadUrl) => {
      await conn.sendMessage(
        m.chat,
        { audio: { url: downloadUrl }, ptt: true, mimetype: 'audio/mpeg' },
        { quoted: m }
      )
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

    // Orden de APIs para descarga
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
    await conn.reply(
      m.chat,
      `❌ *Error:* ${e.message || e}\n\n🔸 *Posibles soluciones:*\n• Verifica el nombre de la canción\n• Intenta con otro tema\n• Prueba más tarde`,
      m
    )
  }
}

handler.tags = ['downloader']
handler.help = ['spotify']
handler.command = ['spotify']

export default handler