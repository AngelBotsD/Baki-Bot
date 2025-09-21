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

  const posibles = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"]

  let videoDownloadUrl = null
  let calidadElegida = "Desconocida"

  try {
    // 🔹 Primero Neoxr
    for (const q of posibles) {
      try {
        const api2 = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&quality=${q}&apikey=russellxz`
        const r2 = await axios.get(api2)

        if (r2.data?.status && r2.data?.data?.url) {
          videoDownloadUrl = r2.data.data.url
          calidadElegida = q
          console.log(`✅ Calidad ${q} encontrada en Neoxr`)
          break
        }
      } catch (err) {
        console.log(`❌ Neoxr no tiene calidad ${q}`)
      }
    }

    // 🔹 Luego Mayapi
    if (!videoDownloadUrl) {
      for (const q of posibles) {
        try {
          const api1 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&quality=${q}&apikey=may-0595dca2`
          const r1 = await axios.get(api1)

          if (r1.data?.status && r1.data?.result?.url) {
            videoDownloadUrl = r1.data.result.url
            calidadElegida = q
            console.log(`✅ Calidad ${q} encontrada en Mayapi`)
            break
          }
        } catch (err) {
          console.log(`❌ Mayapi no tiene calidad ${q}`)
        }
      }
    }

    // 🔹 Si aún no hay link, buscar cualquier calidad disponible (fallback)
    if (!videoDownloadUrl) {
      try {
        const r2 = await axios.get(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&apikey=russellxz`)
        if (r2.data?.status && r2.data?.data?.url) {
          videoDownloadUrl = r2.data.data.url
          calidadElegida = r2.data.data.quality || "Automática"
          console.log(`⚡ Video conseguido en Neoxr con calidad automática`)
        }
      } catch {}

      if (!videoDownloadUrl) {
        const r1 = await axios.get(`https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp4&apikey=may-0595dca2`)
        if (r1.data?.status && r1.data?.result?.url) {
          videoDownloadUrl = r1.data.result.url
          calidadElegida = r1.data.result.quality || "Automática"
          console.log(`⚡ Video conseguido en Mayapi con calidad automática`)
        }
      }
    }

    if (!videoDownloadUrl) throw new Error("No se pudo obtener el video en ninguna calidad")

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
        caption: `
> 🎬 *VIDEO DOWNLOADER*

🎵 *Título:* ${title}
🎤 *Artista:* ${artista}
🕑 *Duración:* ${duration}
📺 *Calidad:* ${calidadElegida}
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
      { text: "⚠️ Error al descargar el video." },
      { quoted: msg }
    )
  }
}

handler.command = ["play2"]

export default handler