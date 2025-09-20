import axios from "axios"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"
import yts from "yt-search"

const streamPipe = promisify(pipeline)

const handler = async (msg, { conn, text }) => {
  if (!text || !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(text)) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: `📎 *𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚄𝚗 𝙻𝚒𝚗𝚔 𝚍𝚎 𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝚙𝚊𝚛𝚊 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚛 𝚎𝚕 𝚅𝚒𝚍𝚎𝚘*` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  try {
    const res = await yts({ videoId: text.split("v=")[1] || text.split("/").pop().split("?")[0] })
    if (!res) throw new Error("No se pudo obtener información del video")

    const { title, timestamp: duration, author } = res
    const artista = author?.name || "Desconocido"

    const captionBase = `
> *𝚈𝚃𝙼𝙿4 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${title}
🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration || "Desconocida"}
`.trim()

    let url = null
    let quality = null

    // Del más bajo al más alto
    const posibles = ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p"]

    for (let q of posibles) {
      try {
        const r = await axios.get(
          `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=video&quality=${q}&apikey=russellxz`
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

    const captionFinal = captionBase + `\n📹 *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* ${quality}`

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        video: fs.readFileSync(file),
        mimetype: "video/mp4",
        fileName: `${title} [${quality}].mp4`,
        caption: captionFinal
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

handler.command = ["ytmp4"]

export default handler