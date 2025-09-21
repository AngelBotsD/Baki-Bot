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
      { text: `*🎬 𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝙴𝚕 𝙽𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝙰𝚕𝚐𝚞𝚗 𝚅𝚒𝚍𝚎𝚘*` },
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

  const caption = `
> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁

🎵 𝚃𝚒𝚝𝚞𝚕𝚘: ${title}
🎤 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${artista}
🕑 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${duration}
`.trim()

  const posibles = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"]

  try {
    let videoDownloadUrl = null

    // 🔍 Probar calidades de mayor a menor
    for (const q of posibles) {
      // ==== Primera API ====
      try {
        const api1 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&quality=${q}&apikey=may-0595dca2`
        const r1 = await axios.get(api1)

        if (r1.data?.status && r1.data?.result?.url) {
          videoDownloadUrl = r1.data.result.url
          console.log(`✅ Calidad ${q} encontrada en la primera API`)
          break
        }
      } catch (err) {
        console.log(`❌ Primera API no tiene calidad ${q}`)
      }

      // ==== Segunda API ====
      try {
        const api2 = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&quality=${q}&apikey=russellxz`
        const r2 = await axios.get(api2)

        if (r2.data?.status && r2.data?.data?.url) {
          videoDownloadUrl = r2.data.data.url
          console.log(`✅ Calidad ${q} encontrada en la segunda API`)
          break
        }
      } catch (err) {
        console.log(`❌ Segunda API no tiene calidad ${q}`)
      }
    }

    if (!videoDownloadUrl) throw new Error("No se pudo obtener el video en ninguna calidad")

    // ====== DESCARGA ======
    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_vid.mp4`)

    const dl = await axios.get(videoDownloadUrl, { responseType: "stream" })
    await streamPipe(dl.data, fs.createWriteStream(file))

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        video: fs.readFileSync(file),
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption
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