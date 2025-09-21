import axios from "axios"
import yts from "yt-search"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"

const streamPipe = promisify(pipeline)

const handler = async (msg, { conn, text }) => {
if (!text || !text.trim()) {
return conn.sendMessage(
msg.key.remoteJid,
{ text: `*🎬 Ingresa el link de un video de YouTube*` },
{ quoted: msg }
)
}

const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+/
if (!ytRegex.test(text)) {
return conn.sendMessage(
msg.key.remoteJid,
{ text: `❌ Ingresa un *link válido* de YouTube.\nEjemplo: .ytmp4 https://youtu.be/abc123xyz` },
{ quoted: msg }
)
}

await conn.sendMessage(msg.key.remoteJid, {
react: { text: "🕒", key: msg.key }
})

const res = await yts({ videoId: text.split("v=")[1] || text.split("/").pop() })
const video = res ? res : null

if (!video) {
return conn.sendMessage(
msg.key.remoteJid,
{ text: "❌ No se pudo obtener información del video." },
{ quoted: msg }
)
}

const { title, timestamp: duration, author } = video
const artista = author.name

const posibles = ["1080p", "720p", "480p", "360p"]

let videoDownloadUrl = null
let calidadElegida = "Desconocida"
let apiUsada = "Desconocida"
let errorLogs = []

try {
for (const q of posibles) {
  let ok = false

  try {
    const api2 = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=video&quality=${q}&apikey=russellxz`
    const r2 = await axios.get(api2, { timeout: 60000 })
    if (r2.data?.status && r2.data?.data?.url) {
      videoDownloadUrl = r2.data.data.url
      calidadElegida = r2.data.data.quality || q
      apiUsada = "NeoxR"
      ok = true
    }
  } catch (err) {
    errorLogs.push(`NeoxR (${q}): ${err.message}`)
  }

  if (!ok) {
    try {
      const api1 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(text)}&type=mp4&quality=${q}&apikey=may-0595dca2`
      const r1 = await axios.get(api1, { timeout: 60000 })
      if (r1.data?.status && r1.data?.result?.url) {
        videoDownloadUrl = r1.data.result.url
        calidadElegida = r1.data.result.quality || q
        apiUsada = "MayAPI"
        ok = true
      }
    } catch (err) {
      errorLogs.push(`MayAPI (${q}): ${err.message}`)
    }
  }

  if (ok) break
}

if (!videoDownloadUrl) {
  throw new Error(
    "No se pudo obtener el video en ninguna calidad.\n\nLogs:\n" +
    errorLogs.join("\n")
  )
}

const tmp = path.join(process.cwd(), "tmp")
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
const file = path.join(tmp, `${Date.now()}_vid.mp4`)

const dl = await axios.get(videoDownloadUrl, { responseType: "stream", timeout: 0 })
await streamPipe(dl.data, fs.createWriteStream(file))

await conn.sendMessage(
  msg.key.remoteJid,
  {
    video: fs.readFileSync(file),
    mimetype: "video/mp4",
    fileName: `${title}.mp4`,
    caption: `

> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁


🎵 𝚃𝚒́𝚝𝚞𝚕𝚘: ${title}
🎤 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${artista}
🕑 𝙳𝚞𝚛𝚊𝚌𝚒𝚘́𝚗: ${duration}
📺 𝙲𝚊𝚕𝚒𝚍𝚊𝚍: ${calidadElegida}
🌐 𝙰𝚙𝚒: ${apiUsada}
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