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
  let apiUsada = "Desconocida"

  try {
    const tryApi = (apiName, urlBuilder) => {
      return new Promise(async (resolve, reject) => {
        try {
          const apiUrl = urlBuilder()
          const r = await axios.get(apiUrl, { timeout: 80000 })
          if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) {
            resolve({
              url: r.data.result?.url || r.data.data?.url,
              quality: r.data.result?.quality || r.data.data?.quality || "Auto",
              api: apiName
            })
            return
          }
          reject(new Error(`${apiName}: No entregó un URL válido`))
        } catch (err) {
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

    const adonixMp4Api = tryApi("AdonixMP4", () =>
      `https://api-adonix.ultraplus.click/download/ytmp4?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`
    )

    const winner = await Promise.any([mayApi, neoxApi, adonixMp4Api])

    videoDownloadUrl = winner.url
    calidadElegida = winner.quality
    apiUsada = winner.api

    console.log(`✅ API ganadora: ${apiUsada} | Calidad: ${calidadElegida}`)

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

🎵 *𝚃𝚒́𝚝𝚞𝚕𝚘:* ${title}
🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
🕑 *𝙳𝚞𝚛𝚊𝚌𝚒𝚘́𝚗:* ${duration}
📺 *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* ${calidadElegida}
🌐 *𝙰𝚙𝚒:* ${apiUsada}

*» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧*
*» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...*

*⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻*

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 ba.𝗑𝗒𝗓\`\`\`
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