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
      { text: "🎬 Ingresa el nombre de algún video" },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "🕒", key: msg.key } })

  const search = await yts({ query: text, hl: "es", gl: "MX" })
  const video = search.videos[0]
  if (!video) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    )
  }

  const { url: videoUrl, title, timestamp: duration, author } = video
  const artista = author.name
  const posibles = ["1080p","720p","480p","360p","240p","144p"]

  let videoDownloadUrl = null
  let apiUsada = "Desconocida"
  let calidadElegida = "Desconocida"

  // 🔥 Función rápida: primera URL que funcione
  const tryDownloadFast = async () => {
    const apis = [
      { name: "MayAPI", url: q => `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&quality=${q}&apikey=may-0595dca2` },
      { name: "NeoxR", url: q => `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&quality=${q}&apikey=russellxz` },
      { name: "AdonixAPI", url: q => `https://api-adonix.ultraplus.click/download/ytmp4?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}&quality=${q}` },
      { name: "Adofreekey", url: q => `https://api-adonix.ultraplus.click/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}&quality=${q}` }
    ]

    for (const api of apis) {
      try {
        for (const q of posibles) {
          const r = await axios.get(api.url(q), { timeout: 10000 })
          if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) {
            return {
              url: r.data.result?.url || r.data.data?.url,
              api: api.name,
              quality: q
            }
          }
        }
      } catch(e) { continue }
    }

    throw new Error("No se pudo obtener el video con ninguna API")
  }

  try {
    const winner = await tryDownloadFast()
    videoDownloadUrl = winner.url
    apiUsada = winner.api
    calidadElegida = winner.quality

    // Plan A: enviar directo streaming
    try {
      await conn.sendMessage(
        msg.key.remoteJid,
        {
          video: { url: videoDownloadUrl },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption: `
> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁

⭒ ִֶָ७ ꯭🎵˙⋆｡ - 𝚃𝚒́𝚝𝚞𝚕𝚘: ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - 𝙲𝚊𝚕𝚒𝚍𝚊𝚍: ${calidadElegida}
⭒ ִֶָ७ ꯭🌐˙⋆｡ - 𝙰𝚙𝚒: ${apiUsada}

» 𝙑𝙄𝘿𝙀𝙊 𝙀𝙽𝙑𝙄𝘼𝘿𝙊  🎧
» 𝘿𝙄𝙎𝙁𝙍𝙐𝙏𝘼𝙇𝙊 𝘾𝘼𝙈𝙋𝙀𝙊𝙉..

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓.𝗑𝗒𝗓\`\`\`
          `.trim(),
          supportsStreaming: true,
          contextInfo: { isHd: true }
        },
        { quoted: msg }
      )
      await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } })
      return
    } catch (err) { /* Plan B */ }

    // Plan B: descargar archivo y enviar
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
> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁

⭒ ִֶָ७ ꯭🎵˙⋆｡ - 𝚃𝚒́𝚝𝚞𝚕𝚘: ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - 𝙲𝚊𝚕𝚒𝚍𝚊𝚍: ${calidadElegida}
⭒ ִֶָ७ ꯭🌐˙⋆｡ - 𝙰𝚙𝚒: ${apiUsada}

» 𝙑𝙄𝘿𝙀𝙊 𝙀𝙽𝙑𝙄𝘼𝘿𝙊  🎧
» 𝘿𝙄𝙎𝙁𝙍𝙐𝙏𝘼𝙇𝙊 𝘾𝘼𝙈𝙋𝙀𝙊𝙉..

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓.𝗑𝗒𝗓\`\`\`
          `.trim(),
        supportsStreaming: true,
        contextInfo: { isHd: true }
      },
      { quoted: msg }
    )

    fs.unlinkSync(file)
    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } })

  } catch(e) {
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