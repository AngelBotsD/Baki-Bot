import fetch from "node-fetch"
import yts from "yt-search"

const APIS = [
  {
    name: "yt1s",
    searchUrl: (videoUrl) => `https://yt1s.io/api/ajaxSearch?q=${encodeURIComponent(videoUrl)}`,
    convertUrl: (vid, k) => `https://yt1s.io/api/ajaxConvert?vid=${vid}&k=${k}&quality=64`,
    extract: async (data) => {
      const k = data?.links?.mp3?.auto?.k
      return k ? `https://yt1s.io/api/ajaxConvert?vid=${data.vid}&k=${k}&quality=64` : null
    }
  },
  {
    name: "zenkey",
    url: (videoUrl) => `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  },
  {
    name: "vreden",
    url: (videoUrl) => `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=64`,
    extract: (data) => data?.result?.download?.url
  }
]

const getAudioUrl = async (videoUrl) => {
  let lastError = null

  for (const api of APIS) {
    try {
      console.log(`Probando API: ${api.name}`)
      let audioUrl

      if (api.name === "yt1s") {
        const searchRes = await fetch(api.searchUrl(videoUrl), { timeout: 5000 })
        if (!searchRes.ok) throw new Error(`HTTP ${searchRes.status}`)
        const data = await searchRes.json()
        audioUrl = await api.extract(data)
      } else {
        const res = await fetch(api.url(videoUrl), { timeout: 5000 })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        audioUrl = await api.extract(data)
      }

      if (audioUrl) {
        console.log(`Éxito con API: ${api.name}`)
        return audioUrl
      }
    } catch (e) {
      console.error(`Error con API ${api.name}:`, e.message)
      lastError = e
      continue
    }
  }

  throw lastError || new Error("Todas las APIs fallaron")
}

let handler = async (m, { conn }) => {
  const body = m.text?.trim()
  if (!body) return
  if (!/^.spotify\s+/i.test(body)) return

  const query = body.replace(/^(.spotify)\s+/i, "").trim()
  if (!query) throw `⭐ Escribe el nombre de la canción\n\nEjemplo: .spotify Bad Bunny - Monaco`

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

    // Buscar en YouTube
    const searchResults = await yts({ query, hl: 'es', gl: 'ES' })
    const video = searchResults.videos[0]
    if (!video) throw new Error("No se encontró el video")
    if (video.seconds > 600) throw "❌ El audio es muy largo (máximo 10 minutos)"

    // Duración formateada
    const minutes = Math.floor(video.seconds / 60)
    const seconds = video.seconds % 60
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`

    // Enviar miniatura con info
    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: `*𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁* \n\n` +
               `🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${video.title}\n` +
               `🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${video.author.name || 'Desconocido'}\n` +
               `🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${durationFormatted}`,
    }, { quoted: m })

    // Descargar audio con prioridad en yt1s
    const audioUrl = await getAudioUrl(video.url)

    // Enviar audio como PTT
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${video.title.slice(0, 30)}.mp3`.replace(/[^\w\s.-]/gi, ''),
      ptt: true
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (error) {
    console.error("Error:", error)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })

    const errorMsg = typeof error === 'string' ? error : 
      `❌ *Error:* ${error.message || 'Ocurrió un problema'}\n\n` +
      `🔸 *Posibles soluciones:*\n` +
      `• Verifica el nombre de la canción\n` +
      `• Intenta con otro tema\n` +
      `• Prueba más tarde`

    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
  }
}

handler.customPrefix = /^(.spotify)\s+/i
handler.command = new RegExp
handler.exp = 0

export default handler