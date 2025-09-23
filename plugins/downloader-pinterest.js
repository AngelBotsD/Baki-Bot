import axios from "axios"
import yts from "yt-search"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"
import ytdl from "ytdl-core"

const streamPipe = promisify(pipeline)
const MAX_FILE_SIZE = 60 * 1024 * 1024

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "🎬 Ingresa el link de un video de YouTube" },
      { quoted: msg }
    )
  }

  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(text.trim())) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "⚠️ Solo se permiten links de YouTube.\n\nEjemplo:\n.play2 https://youtu.be/dQw4w9WgXcQ" },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  const videoUrl = text.trim()
  const posibles = ["2160p","1440p","1080p","720p","480p","360p","240p","144p"]

  let videoDownloadUrl = null
  let calidadElegida = "Desconocida"
  let apiUsada = "Desconocida"

  let title = "Desconocido", artista = "Desconocido", duration = "Desconocida"

  try {
    const info = await ytdl.getInfo(videoUrl)
    title = info.videoDetails.title || title
    artista = info.videoDetails.author?.name || artista
    duration = new Date(info.videoDetails.lengthSeconds*1000).toISOString().substr(11,8) || duration
  } catch {
    // si falla, usamos valores por defecto
  }

  try {
    const tryApi = (apiName, urlBuilder) => {
      return new Promise(async (resolve, reject) => {
        const controller = new AbortController()
        try {
          for (const q of posibles) {
            const apiUrl = urlBuilder(q)
            const r = await axios.get(apiUrl, { timeout: 25000, signal: controller.signal })
            if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) {
              resolve({
                url: r.data.result?.url || r.data.data?.url,
                quality: r.data.result?.quality || r.data.data?.quality || q,
                api: apiName,
                controller
              })
              return
            }
          }
          reject(new Error(`${apiName}: No entregó un URL válido`))
        } catch (err) {
          reject(new Error(`${apiName}: ${err.message}`))
        }
      })
    }

    const apis = [
      tryApi("MayAPI", q => `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&quality=${q}&apikey=may-0595dca2`),
      tryApi("NeoxR", q => `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&quality=${q}&apikey=russellxz`),
      tryApi("AdonixAPI", q => `https://api-adonix.ultraplus.click/download/ytmp4?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}&quality=${q}`)
    ]

    let winner
    try { 
      winner = await Promise.any(apis) 
    } catch {
      // retry silencioso automático si falla
      winner = await Promise.any(apis)
    }

    apis.forEach(p => { if(p.controller) p.controller.abort() })

    videoDownloadUrl = winner.url
    calidadElegida = winner.quality
    apiUsada = winner.api

    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_vid.mp4`)

    const dl = await axios.get(videoDownloadUrl, { responseType: "stream", timeout: 0 })
    let totalSize = 0
    dl.data.on("data", chunk => {
      totalSize += chunk.length
      if (totalSize > MAX_FILE_SIZE) dl.data.destroy()
    })

    await streamPipe(dl.data, fs.createWriteStream(file))

    const stats = fs.statSync(file)
    if (stats.size > MAX_FILE_SIZE) {
      fs.unlinkSync(file)
      throw new Error("El archivo excede el límite de 60 MB permitido por WhatsApp.")
    }

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        video: fs.readFileSync(file),
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: `

> *𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

⭒ ִֶָ७ ꯭🎵˙⋆｡ - *𝚃𝚒́𝚝𝚞𝚕𝚘:* ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - *𝙳𝚞𝚛𝚊𝚌𝚒𝚘́𝚗:* ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* ${calidadElegida}
⭒ ִֶָ७ ꯭🌐˙⋆｡ - *𝙰𝚙𝚒:* ${apiUsada}

» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧
» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 ba.𝗑𝗒𝗓\`\`\`
`.trim(),
        supportsStreaming: true,
        contextInfo: { isHd: true }
      },
      { quoted: msg }
    )

    fs.unlinkSync(file)
    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(
      msg.key.remoteJid,
      { text: `⚠️ Error al descargar el video:\n\n${e.message}` },
      { quoted: msg }
    )
  }
}

handler.command = ["ytmp4"]
export default handler