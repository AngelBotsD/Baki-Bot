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
      { text: `*🎬 Ingresa el nombre de algún video*` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  try {
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

    const posibles = ["2160p","1440p","1080p","720p","480p","360p","240p","144p"]

    let downloadUrl = null
    let calidadElegida = null

    // 🔹 Intentar con primera API (Mayapi)
    try {
      for (const q of posibles) {
        const api1 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&apikey=may-0595dca2`
        const res1 = await axios.get(api1)
        if (res1.data?.status && res1.data?.result?.url) {
          downloadUrl = res1.data.result.url
          calidadElegida = res1.data.result.quality || q
          break
        }
      }
    } catch (e) {
      console.log("⚠️ Falló Mayapi:", e.message)
    }

    // 🔹 Si la primera no funcionó, intentar con segunda API (Neoxr)
    if (!downloadUrl) {
      try {
        for (const q of posibles) {
          const api2 = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&quality=${q}&apikey=russellxz`
          const res2 = await axios.get(api2)
          if (res2.data?.status && res2.data?.data?.url) {
            downloadUrl = res2.data.data.url
            calidadElegida = res2.data.data.quality || q
            break
          }
        }
      } catch (e) {
        console.log("⚠️ Falló Neoxr:", e.message)
      }
    }

    if (!downloadUrl) {
      throw new Error("Ninguna API pudo entregar el video")
    }

    const caption = `
> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁

🎵 Título: ${title}
🎤 Artista: ${artista}
🕑 Duración: ${duration}
📹 Calidad: ${calidadElegida || "Desconocida"}
`.trim()

    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_vid.mp4`)

    const dl = await axios.get(downloadUrl, { responseType: "stream" })
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
    console.error("Error final:", e)
    await conn.sendMessage(
      msg.key.remoteJid,
      { text: "⚠️ No se pudo descargar el video en ninguna calidad." },
      { quoted: msg }
    )
  }
}

handler.command = ["play2"]

export default handler