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
      { text: "*🎬 Ingresa el nombre de algún video*" },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  const res = await yts(text)
  const video = res.videos[0]
  if (!video) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    )
  }

  const { url: videoUrl, title, timestamp: duration, author } = video
  const artista = author.name

  let videoDownloadUrl = null
  let calidadElegida = "Desconocida"
  let apiUsada = "MayAPI"

  try {
    const api1 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&apikey=may-0595dca2`
    const r1 = await axios.get(api1, { timeout: 60000 })

    if (r1.data?.status && r1.data?.result?.url) {
      videoDownloadUrl = r1.data.result.url
      calidadElegida = r1.data.result.quality || "Desconocida"
    }

    if (!videoDownloadUrl) {
      throw new Error("MayAPI no devolvió ninguna URL de descarga.")
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

handler.command = ["play2"]

export default handler