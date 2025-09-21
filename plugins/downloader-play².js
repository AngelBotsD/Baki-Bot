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
      { text: "*🎵 Ingresa el nombre de alguna canción*" },
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

  const { url, title, timestamp: duration, author } = video
  const artista = author.name

  try {
    const apiUrl = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp3&apikey=soymaycol<3`
    const r = await axios.get(apiUrl)

    if (!r.data?.status || !r.data?.result?.url) {
      throw new Error("No se pudo obtener el audio en MP3")
    }

    const audioUrl = r.data.result.url
    const calidadElegida = r.data.result.quality || "Desconocida"

    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_aud.mp3`)

    const dl = await axios.get(audioUrl, { responseType: "stream" })
    await streamPipe(dl.data, fs.createWriteStream(file))

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        audio: fs.readFileSync(file),
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        caption: `
> 🎵 MUSIC DOWNLOADER

🎵 Título: ${title}
🎤 Artista: ${artista}
🕑 Duración: ${duration}
📺 Calidad: ${calidadElegida}
`.trim(),
      },
      { quoted: msg }
    )

    fs.unlinkSync(file)

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: "✅", key: msg.key }
    })

  } catch (e) {
    console.error("❌ ERROR DETALLADO:", e)
    await conn.sendMessage(
      msg.key.remoteJid,
      { text: `⚠️ Error al descargar el audio:\n\n${e.message || e}` },
      { quoted: msg }
    )
  }
}

handler.command = ["play"]

export default handler