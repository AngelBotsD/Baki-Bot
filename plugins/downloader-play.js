import axios from "axios"
import yts from "yt-search"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"

const streamPipe = promisify(pipeline)
const MAX_FILE_SIZE = 60 * 1024 * 1024
const owners = ["521XXXXXXXXX@s.whatsapp.net", "521YYYYYYYYY@s.whatsapp.net"]

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(msg.key.remoteJid, { text: "🎶 Ingresa el nombre de alguna canción" }, { quoted: msg })
  }

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "🕒", key: msg.key } })

  const res = await yts({ query: text, hl: "es", gl: "MX" })
  const song = res.videos[0]
  if (!song) return conn.sendMessage(msg.key.remoteJid, { text: "❌ Sin resultados." }, { quoted: msg })

  const { url: videoUrl, title, timestamp: duration, author, thumbnail } = song
  const artista = author.name
  let audioDownloadUrl = null
  let apiUsada = "Desconocida"

  const tryApi = async (apiName, url, controller) => {
    const r = await axios.get(url, { timeout: 10000, signal: controller.signal })
    const audioUrl = r.data?.result?.url || r.data?.data?.url
    if (audioUrl) return { url: audioUrl, api: apiName }
    throw new Error(`${apiName}: No entregó URL válido`)
  }

  const apis = [
    (c) => tryApi("Api 1M", `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&apikey=may-0595dca2`, c),
    (c) => tryApi("Api 2A", `https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`, c),
    (c) => tryApi("Api 3F", `https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}`, c),
    (c) => tryApi("Neoxr", `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`, c)
  ]

  const tryDownload = async () => {
    let lastError
    for (let attempt = 1; attempt <= 3; attempt++) {
      const controllers = apis.map(() => new AbortController())
      const startTime = Date.now()
      try {
        const tasks = apis.map((api, i) => api(controllers[i]))
        const winner = await Promise.any(tasks)
        const elapsed = Date.now() - startTime
        controllers.forEach(c => c.abort())
        owners.forEach(ownerJid => {
          conn.sendMessage(ownerJid, {
            text: `🎯 𝐀𝐏𝐈 𝐆𝐀𝐍𝐀𝐃𝐎𝐑𝐀\n• API: ${winner.api}\n• Tiempo: ${elapsed}ms\n• Video: ${title}`
          })
        })
        return winner
      } catch (err) {
        lastError = err
        if (attempt < 3) await conn.sendMessage(msg.key.remoteJid, { react: { text: "🔄", key: msg.key } })
        if (attempt === 3) throw lastError
      }
    }
  }

  try {
    const winner = await tryDownload()
    audioDownloadUrl = winner.url
    apiUsada = winner.api

    await conn.sendMessage(msg.key.remoteJid, {
      image: { url: thumbnail },
      caption: `
> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁

⭒ ִֶָ७ ꯭🎵˙⋆｡ - 𝚃𝚒́𝚝𝚞𝚕𝚘: ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - 𝙲𝚊𝚕𝚒𝚍𝚊𝚍: 128kbps
⭒ ִֶָ७ ꯭🌐˙⋆｡ - 𝙰𝚙𝚒: ${apiUsada}

» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧
» 𝘈𝘎𝘜𝘈𝘙𝘋𝘓𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓.𝗑𝗒𝗓\`\`\`
      `.trim()
    }, { quoted: msg })

    const tmp = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)
    const file = path.join(tmp, `${Date.now()}_audio.mp3`)

    const dl = await axios.get(audioDownloadUrl, { responseType: "stream", timeout: 0 })
    let totalSize = 0
    dl.data.on("data", chunk => {
      totalSize += chunk.length
      if (totalSize > MAX_FILE_SIZE) dl.data.destroy()
    })

    await streamPipe(dl.data, fs.createWriteStream(file))

    const stats = fs.statSync(file)
    if (stats.size > MAX_FILE_SIZE) {
      fs.unlinkSync(file)
      throw new Error("El archivo excede el límite de 60 MB permitido por WhatsApp.")
    }

    await conn.sendMessage(msg.key.remoteJid, {
      audio: fs.readFileSync(file),
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: msg })

    fs.unlinkSync(file)
    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } })

  } catch (e) {
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ *Error:* ${e.message || "Ocurrió un problema"}\n\n🔸 Posibles soluciones:\n• Verifica el nombre de la canción\n• Intenta con otro tema\n• Prueba más tarde`
    }, { quoted: msg })
  }
}

handler.command = ["play"]
export default handler