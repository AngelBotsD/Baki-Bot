import axios from "axios"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"
import yts from "yt-search"

const streamPipe = promisify(pipeline)

const handler = async (msg, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: `📎 *𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚞𝚗𝚊 𝚌𝚊𝚗𝚌𝚒ó𝚗 𝚙𝚊𝚛𝚊 𝚋𝚞𝚜𝚌𝚊𝚛 𝚎𝚗 𝚈𝚘𝚞𝚝𝚞𝚋𝚎*` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  try {
    const search = await yts(text)
    if (!search.videos.length) throw new Error("No encontré resultados")
    const video = search.videos[0]

    const { title, timestamp: duration, author, url: videoUrl } = video
    const artista = author?.name || "Desconocido"

    const caption = `
> *𝚈𝚃𝙼𝙿4 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${title}
🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration || "Desconocida"}
`.trim()

    let url = null
    let quality = null

    const posibles = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"]
    for (let q of posibles) {
      try {
        const r = await axios.get(
          `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&mp4=video&quality=${q}&apikey=may-0595dca2`
        )
        if (r.data?.status && r.data.data?.url) {
          url = r.data.data.url
          quality = q
          break
        }
      } catch {}
    }

    if (!url) throw new Error("No se pudo obtener el video")

    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_vid.mp4`)

    const dl = await axios.get(url, { responseType: "stream" })
    await streamPipe(dl.data, fs.createWriteStream(file))

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        video: fs.readFileSync(file),
        mimetype: "video/mp4",
        fileName: `${title} [${quality}].mp4`,
        caption: caption + `\n📹 *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* ${quality}`
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
      { text: "⚠️ Error al descargar el video." },
      { quoted: msg }
    )
  }
}

handler.command = ["play2"]

export default handler