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
      { text: "🎵 Ingresa el nombre de un video para buscar" },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  const searchQuery = text.trim()
  let audioDownloadUrl = null
  let calidadElegida = "Desconocida"
  let apiUsada = "Desconocida"

  try {
    // Buscar video con yt-search
    const res = await yts(searchQuery)
    const video = res.videos[0]
    if (!video) {
      return conn.sendMessage(
        msg.key.remoteJid,
        { text: "❌ No se encontró ningún resultado." },
        { quoted: msg }
      )
    }

    const videoUrl = video.url
    const title = video.title || "Desconocido"
    const artista = video.author?.name || "Desconocido"
    const duration = video.timestamp || "Desconocida"
    const thumb = video.thumbnail

    const tryApi = (apiName, urlBuilder) => {
      return new Promise(async (resolve, reject) => {
        try {
          const apiUrl = urlBuilder()
          const r = await axios.get(apiUrl, { timeout: 60000 })
          if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) {
            resolve({
              url: r.data.result?.url || r.data.data?.url,
              quality: r.data.result?.quality || r.data.data?.quality || "128kbps",
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

    // APIs
    const mayApi = tryApi("MayAPI", () =>  
      `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=may-0595dca2`  
    )  

    const neoxApi = tryApi("NeoxR", () =>  
      `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`  
    )  

    const adonixApi = tryApi("Adonix API", () =>  
      `https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`  
    )  

    // Competencia 🔥
    const winner = await Promise.any([mayApi, neoxApi, adonixApi])

    audioDownloadUrl = winner.url
    calidadElegida = winner.quality
    apiUsada = winner.api

    // Descargar archivo temporal
    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_audio.mp3`)

    const dl = await axios.get(audioDownloadUrl, { responseType: "stream", timeout: 0 })
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

    // Enviar portada con info 📌
    await conn.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: thumb },
        caption: `
> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁

*🎵 Título:* ${title}
*🎤 Artista:* ${artista}
*🕑 Duración:* ${duration}
*📺 Calidad:* ${calidadElegida}
*🌐 Api:* ${apiUsada}

» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖 🎧
» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...

⇆ ◁ ❚❚ ▷ ↻

> \`\`\`© Powered by ba.xyz\`\`\`
`.trim()
      },
      { quoted: msg }
    )

    // Enviar audio 🎶
    await conn.sendMessage(
      msg.key.remoteJid,
      {
        audio: fs.readFileSync(file),
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
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
      { text: `⚠️ Error al descargar el audio:\n\n${e.message}` },
      { quoted: msg }
    )
  }
}

handler.command = ["play"]

export default handler