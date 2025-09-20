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
      { text: `❌ Ingresa un link válido de YouTube.` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  try {
    // Obtener información del video a partir del link
    const res = await yts({ videoId: text.split("v=")[1] || text.split("/").pop().split("?")[0] })
    if (!res) throw new Error("No se pudo obtener información del video")

    const { title, timestamp: duration, author } = res
    const artista = author?.name || "Desconocido"

    const caption = `
> *VIDEO DOWNLOADER*

🎵 *Título:* ${title}
🎤 *Canal:* ${artista}
🕑 *Duración:* ${duration || "Desconocida"}
`.trim()

    // Descargar en la mejor calidad disponible
    const qualities = ["720p", "480p", "360p"]
    let url = null

    for (let q of qualities) {
      try {
        const r = await axios.get(
          `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(text)}&type=video&quality=${q}&apikey=russellxz`
        )
        if (r.data?.status && r.data.data?.url) {
          url = r.data.data.url
          break
        }
      } catch {}
    }

    if (!url) throw new Error("No se pudo obtener el video")

    // Crear carpeta temporal
    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_vid.mp4`)

    // Descargar y guardar
    const dl = await axios.get(url, { responseType: "stream" })
    await streamPipe(dl.data, fs.createWriteStream(file))

    // Enviar el video
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

    // Borrar archivo temporal
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