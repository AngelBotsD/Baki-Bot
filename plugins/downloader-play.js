import axios from "axios"
import yts from "yt-search"

const MAX_FILE_SIZE = 60 * 1024 * 1024

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: "🎶 Ingresa el nombre de alguna canción",
    }, { quoted: msg })
  }

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "🕒", key: msg.key } })

  // Búsqueda rápida
  const res = await yts({ query: text, hl: "es", gl: "MX" })
  const song = res.videos[0]
  if (!song) return conn.sendMessage(msg.key.remoteJid, { text: "❌ Sin resultados." }, { quoted: msg })

  const { url: videoUrl, title, timestamp: duration, author, thumbnail } = song
  const artista = author.name
  let audioDownloadUrl = null
  let apiUsada = "Desconocida"

  // Lista de APIs (todas en carrera)
  const apis = [
    async () => {
      const r = await axios.get(`https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&apikey=may-0595dca2`, { timeout: 9000 })
      if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) return { url: r.data.result?.url || r.data.data?.url, api: "MayAPI" }
      throw new Error("MayAPI: URL inválido")
    },
    async () => {
      const r = await axios.get(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`, { timeout: 9000 })
      if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) return { url: r.data.result?.url || r.data.data?.url, api: "Adonix1" }
      throw new Error("Adonix1: URL inválido")
    },
    async () => {
      const r = await axios.get(`https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}`, { timeout: 9000 })
      if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) return { url: r.data.result?.url || r.data.data?.url, api: "Adonix2" }
      throw new Error("Adonix2: URL inválido")
    },
    async () => {
      const r = await axios.get(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`, { timeout: 9000 })
      if (r.data?.status && r.data?.result?.url) return { url: r.data.result.url, api: "Neoxr" }
      throw new Error("Neoxr: URL inválido")
    },
    async () => {
      const r = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=64`, { timeout: 9000 })
      if (r.data?.result?.download?.url) return { url: r.data.result.download.url, api: "Vreden" }
      throw new Error("Vreden: URL inválido")
    },
    async () => {
      const r = await axios.get(`https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(videoUrl)}&quality=64`, { timeout: 9000 })
      if (r.data?.result?.download?.url) return { url: r.data.result.download.url, api: "ZenKey" }
      throw new Error("ZenKey: URL inválido")
    }
  ]

  const tryDownload = async () => {
    let lastError
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await new Promise((resolve, reject) => {
          let settled = false
          let errors = []
          apis.forEach(p => {
            p().then(result => {
              if (!settled) {
                settled = true
                resolve(result)
              }
            }).catch(err => {
              errors.push(err)
              if (errors.length === apis.length && !settled) reject(new Error("No se pudo obtener audio de ninguna API"))
            })
          })
        })
      } catch (err) {
        lastError = err
        if (attempt === 3) throw lastError
      }
    }
  }

  try {
    const winner = await tryDownload()
    audioDownloadUrl = winner.url
    apiUsada = winner.api

    // Info del video
    await conn.sendMessage(msg.key.remoteJid, {
      image: { url: thumbnail },
      caption: `
⭒ ִֶָ७ ꯭🎵˙⋆｡ - Título: ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - Artista: ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - Duración: ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - Calidad: 128kbps
⭒ ִֶָ७ ꯭🌐˙⋆｡ - API: ${apiUsada}

» ENVIANDO AUDIO 🎧
⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻
`.trim()
    }, { quoted: msg })

    await conn.sendMessage(msg.key.remoteJid, {
      audio: { url: audioDownloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: msg })

    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } })

  } catch (e) {
    await conn.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } })
    await conn.sendMessage(msg.key.remoteJid, { text: `❌ *Error:* ${e.message || 'Ocurrió un problema'}\n🔸 Posibles soluciones:\n• Verifica el nombre de la canción\n• Intenta con otro tema\n• Prueba más tarde` }, { quoted: msg })
  }
}

handler.command = ["play"]
export default handler