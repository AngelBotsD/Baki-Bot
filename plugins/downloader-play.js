import axios from "axios"
import yts from "yt-search"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"

const streamPipe = promisify(pipeline)

const handler = async (msg, { conn, text }) => {
  const pref = global.prefixes?.[0] || "."

  if (!text || !text.trim()) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: `✳️ Usa:\n${pref}play2 <término>\nEj: *${pref}play2* pxndx` },
      { quoted: msg }
    )
  }

  // reacción de carga
  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "🕒", key: msg.key }
  })

  // búsqueda
  const res = await yts(text)
  const video = res.videos[0]
  if (!video) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    )
  }

  const { url: videoUrl, title, timestamp: duration, views, author } = video
  const viewsFmt = views.toLocaleString()

  const caption = `
❦ BAJI 𝑩𝑶𝑻❦

🎬 𝑻𝒊𝒕𝒖𝒍𝒐: ${title}
🕑 𝑫𝒖𝒓𝒂𝒄𝒊𝒐𝒏: ${duration}
👁‍🗨 𝑽𝒊𝒔𝒕𝒂𝒔: ${viewsFmt}
👤 𝑨𝒖𝒕𝒐𝒓: ${author.name}
🔗 𝑳𝒊𝒏𝒌: ${videoUrl}
`.trim()

  try {
    // busca calidad disponible
    const qualities = ["720p", "480p", "360p"]
    let url = null

    for (let q of qualities) {
      try {
        const r = await axios.get(
          `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&quality=${q}&apikey=russellxz`
        )
        if (r.data?.status && r.data.data?.url) {
          url = r.data.data.url
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