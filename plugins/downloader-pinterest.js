import axios from "axios"
import yts from "yt-search"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"

const streamPipe = promisify(pipeline)
const MAX_FILE_SIZE = 60 * 1024 * 1024

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "*🎬 Ingresa el link de un video de YouTube*" },
      { quoted: msg }
    )
  }

  if (!text.includes("youtube.com") && !text.includes("youtu.be")) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Ingresa un link válido de YouTube." },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  const videoUrl = text.trim()
  let videoDownloadUrl = null
  let calidadElegida = "Desconocida"
  let apiUsada = "Desconocida"
  let errorLogs = []
  let title = "Desconocido"
  let duration = "Desconocida"
  let artista = "Desconocido"

  try {
    // Obtener info del video usando yts
    const res = await yts(videoUrl)
    const video = res.videos[0]
    if (video) {
      title = video.title
      duration = video.timestamp
      artista = video.author.name
    }

    const tryApi = (apiName, urlBuilder) => {
      return new Promise(async (resolve, reject) => {
        const controller = new AbortController()
        try {
          const apiUrl = urlBuilder()
          const r = await axios.get(apiUrl, {
            timeout: 60000,
            signal: controller.signal
          })
          if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) {
            resolve({
              url: r.data.result?.url || r.data.data?.url,
              quality: r.data.result?.quality || r.data.data?.quality || "Desconocida",
              api: apiName,
              controller
            })
            return
          }
          reject(new Error(`${apiName}: No entregó un URL válido`))
        } catch (err) {
          errorLogs.push(`${apiName}: ${err.message}`)
          reject(new Error(`${apiName}: ${err.message}`))
        }
      })
    }

    const mayApi = tryApi("MayAPI", () =>
      `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&apikey=may-0595dca2`
    )

    const neoxApi = tryApi("NeoxR", () =>
      `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&apikey=russellxz`
    )

    let winner
    try {
      winner = await Promise.any([mayApi, neoxApi])
    } catch (err) {
      throw new Error(
        "No se pudo obtener el video en ninguna calidad.\n\n*Logs:*\n" +
        errorLogs.join("\n")
      )
    }

    ;[mayApi, neoxApi].forEach(p => {
      if (p !== winner && p.controller) {
        p.controller.abort()
      }
    })

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
      if (totalSize > MAX_FILE_SIZE) {
        dl.data.destroy()
      }
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

🎵 *𝚃í𝚝𝚞𝚕𝚘:* ${title}
🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}
📺 *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* ${calidadElegida}
🌐 *𝙰𝚙𝚒:* ${apiUsada}
`.trim(),
        supportsStreaming: true,
        contextInfo: { isHd: true }
      },
      { quoted: msg }
    )

    fs.unlinkSync(file)

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: "✅", key: msg.key }
    })
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