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
      { text: "*🎬 Ingresa el nombre de algún video o canción*" },
      { quoted: msg }
    )
  }

  // Reacción inicial
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

  const posibles = ["128kbps", "192kbps", "320kbps"]

  let audioDownloadUrl = null
  let calidadElegida = "Desconocida"
  let apiUsada = "Desconocida"
  let errorLogs = []

  try {
    const controllers = []
    const tareas = posibles.flatMap((q) => {
      return [
        (async () => {
          const controller = new AbortController()
          controllers.push(controller)
          try {
            const api1 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&quality=${q}&apikey=may-0595dca2`
            const r1 = await axios.get(api1, { timeout: 60000, signal: controller.signal })
            if (r1.data?.status && r1.data?.result?.url) {
              return { url: r1.data.result.url, quality: r1.data.result.quality || q, api: "MayAPI" }
            }
          } catch (err) {
            errorLogs.push(`MayAPI (${q}): ${err.message}`)
          }
          throw new Error()
        })(),
        (async () => {
          const controller = new AbortController()
          controllers.push(controller)
          try {
            const api2 = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=${q}&apikey=russellxz`
            const r2 = await axios.get(api2, { timeout: 60000, signal: controller.signal })
            if (r2.data?.status && r2.data?.data?.url) {
              return { url: r2.data.data.url, quality: r2.data.data.quality || q, api: "NeoxR" }
            }
          } catch (err) {
            errorLogs.push(`NeoxR (${q}): ${err.message}`)
          }
          throw new Error()
        })()
      ]
    })

    const ganador = await Promise.any(tareas)

    controllers.forEach((c) => c.abort())

    if (!ganador?.url) {
      throw new Error("No se pudo obtener el audio.\n\nLogs:\n" + errorLogs.join("\n"))
    }

    audioDownloadUrl = ganador.url
    calidadElegida = ganador.quality
    apiUsada = ganador.api

    // Primero manda la info
    await conn.sendMessage(
      msg.key.remoteJid,
      {
        text: `
> *🎶 AUDIO DOWNLOADER*

🎵 *Título:* ${title}
🎤 *Artista:* ${artista}
🕑 *Duración:* ${duration}
🎧 *Calidad:* ${calidadElegida}
🌐 *Api:* ${apiUsada}
`.trim()
      },
      { quoted: msg }
    )

    // Luego descarga y manda el audio
    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_aud.mp3`)

    const dl = await axios.get(audioDownloadUrl, { responseType: "stream", timeout: 0 })
    await streamPipe(dl.data, fs.createWriteStream(file))

    const stats = fs.statSync(file)
    const sizeMB = stats.size / (1024 * 1024)
    if (sizeMB > 60) {
      fs.unlinkSync(file)
      throw new Error(`El archivo es demasiado grande (${sizeMB.toFixed(2)} MB). Límite 60 MB.`)
    }

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

    // Reacción final
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