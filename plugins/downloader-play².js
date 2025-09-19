import fetch from "node-fetch"
import yts from "yt-search"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"

const getAudioUrl = async (videoUrl) => {
  const api = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`
  const res = await fetch(api)
  if (!res.ok) throw new Error(`API Neoxr falló: ${res.status}`)
  const data = await res.json()
  return data?.data?.url
}

const convertToPtt = (input, output) => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", input,
      "-vn",
      "-acodec", "libopus",
      "-ar", "48000",
      "-ac", "1",
      "-b:a", "64k",
      "-f", "ogg",
      output
    ])

    ffmpeg.stderr.on("data", d => console.log("FFmpeg:", d.toString()))
    ffmpeg.on("close", code => {
      if (code === 0) resolve(output)
      else reject(new Error("Error al convertir a PTT"))
    })
  })
}

let handler = async (m, { conn }) => {
  const body = m.text?.trim()
  if (!body) return
  if (!/^play|.play\s+/i.test(body)) return

  const query = body.replace(/^(play|.play)\s+/i, "").trim()
  if (!query) throw `⭐ Escribe el nombre de la canción\n\nEjemplo: play Bad Bunny - Monaco`

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

    const searchResults = await yts({ query, hl: "es", gl: "ES" })
    const video = searchResults.videos[0]
    if (!video) throw new Error("No se encontró el video")
    if (video.seconds > 600) throw "❌ El audio es muy largo (máximo 10 minutos)"

    const minutes = Math.floor(video.seconds / 60)
    const seconds = video.seconds % 60
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, "0")}`

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: `> *𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n` +
               `🎵 *𝚃𝚒𝚞𝚕𝚘:* ${video.title}\n` +
               `🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${video.author.name || "Desconocido"}\n` +
               `🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${durationFormatted}`,
    }, { quoted: m })

    const audioUrl = await getAudioUrl(video.url)
    if (!audioUrl) throw new Error("La API no devolvió un link de audio")

    const tmpMp3 = path.join(process.cwd(), `${Date.now()}.mp3`)
    const tmpOgg = path.join(process.cwd(), `${Date.now()}.ogg`)

    const res = await fetch(audioUrl)
    if (!res.ok) throw new Error("El link de descarga no funcionó")

    const fileStream = fs.createWriteStream(tmpMp3)
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream)
      res.body.on("error", reject)
      fileStream.on("finish", resolve)
    })

    // ⚠️ Verificar peso mínimo para evitar audios vacíos
    const stats = fs.statSync(tmpMp3)
    if (stats.size < 100 * 1024) { // menos de 100kb
      fs.unlinkSync(tmpMp3)
      throw new Error("El archivo descargado es inválido o está vacío")
    }

    await convertToPtt(tmpMp3, tmpOgg)

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(tmpOgg),
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    }, { quoted: m })

    fs.unlinkSync(tmpMp3)
    fs.unlinkSync(tmpOgg)

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (error) {
    console.error("Error:", error)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })

    const errorMsg = typeof error === "string" ? error : 
      `❌ *Error:* ${error.message || "Ocurrió un problema"}\n\n` +
      `🔸 *Posibles soluciones:*\n` +
      `• Verifica el nombre de la canción\n` +
      `• Intenta con otro tema\n` +
      `• Prueba más tarde`

    await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
  }
}

handler.customPrefix = /^(play|.play)\s+/i
handler.command = new RegExp
handler.exp = 0

export default handler