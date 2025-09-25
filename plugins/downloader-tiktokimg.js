import axios from "axios"
import fs from "fs"
import path from "path"
import { promisify } from "util"
import { pipeline } from "stream"

const streamPipe = promisify(pipeline)
const MAX_FILE_SIZE = 60 * 1024 * 1024

const handler = async (msg, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "🎶 Ingresa un enlace de YouTube válido" },
      { quoted: msg }
    )
  }

  const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
  if (!videoMatch) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Solo se permite un enlace de YouTube válido." },
      { quoted: msg }
    )
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoMatch[1]}`
  await conn.sendMessage(msg.key.remoteJid, { react: { text: "🕒", key: msg.key } })

  let audioDownloadUrl = null
  let apiUsada = "Desconocida"
  let videoInfo = { title: "Desconocido", thumbnail: "", duration: "Desconocida", author: { name: "Desconocido" } }

  const tryDownload = async () => {
    const tryApi = (apiName, urlBuilder) => new Promise(async (resolve, reject) => {
      try {
        const apiUrl = urlBuilder()
        const r = await axios.get(apiUrl, { timeout: 7000 })
        if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) {
          resolve({
            url: r.data.result?.url || r.data.data?.url,
            api: apiName,
            info: {
              title: r.data.result?.title || r.data.data?.title || "Desconocido",
              thumbnail: r.data.result?.thumbnail || r.data.data?.thumbnail || "",
              duration: r.data.result?.duration || r.data.data?.duration || "Desconocida",
              author: { name: r.data.result?.author || r.data.data?.author || "Desconocido" }
            }
          })
        } else reject(new Error(`${apiName}: No entregó un URL válido`))
      } catch (err) {
        reject(new Error(`${apiName}: ${err.message}`))
      }
    })

    const apis = [
      tryApi("Api 1M", () => `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&apikey=may-0595dca2`),
      tryApi("Api 2A", () => `https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`),
      tryApi("Api 3F", () => `https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}`)
    ]

    return new Promise((resolve, reject) => {
      let settled = false
      let errors = []

      apis.forEach(p => {
        p.then(result => {
          if (!settled) {
            settled = true
            resolve(result)
          }
        }).catch(err => {
          errors.push(err)
          if (errors.length === apis.length && !settled) {
            reject(new Error("❌ No se pudo obtener audio de ninguna API"))
          }
        })
      })
    })
  }

  try {
    const winner = await tryDownload()
    audioDownloadUrl = winner.url
    apiUsada = winner.api
    videoInfo = winner.info

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: videoInfo.thumbnail },
        caption: `
> *𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

⭒ 🎵 - *𝚃𝚒́𝚝𝚞𝚕𝚘:* ${videoInfo.title}
⭒ 🎤 - *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${videoInfo.author.name}
⭒ 🕑 - *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${videoInfo.duration}
⭒ 📺 - *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* 128kbps
⭒ 🌐 - *𝙰𝚙𝚒:* ${apiUsada}

*» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧*
*» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...*

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓.𝗑𝗒𝗓\`\`\`
        `.trim()
      },
      { quoted: msg }
    )

    let usarUrlDirecto = true
    try {
      if (usarUrlDirecto) {
        await conn.sendMessage(
          msg.key.remoteJid,
          {
            audio: { url: audioDownloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${videoInfo.title}.mp3`,
            ptt: false
          },
          { quoted: msg }
        )
      }
    } catch (err) {
      usarUrlDirecto = false
    }

    if (!usarUrlDirecto) {
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

      await conn.sendMessage(
        msg.key.remoteJid,
        {
          audio: fs.readFileSync(file),
          mimetype: "audio/mpeg",
          fileName: `${videoInfo.title}.mp3`,
          ptt: false
        },
        { quoted: msg }
      )

      fs.unlinkSync(file)
    }

    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } })

  } catch (e) {
    const errorMsg = typeof e === "string"
      ? e
      : `❌ *Error:* ${e.message || "Ocurrió un problema"}\n\n` +
        `🔸 *Posibles soluciones:*\n` +
        `• Verifica el enlace de YouTube\n` +
        `• Intenta con otro link\n` +
        `• Prueba más tarde`

    await conn.sendMessage(
      msg.key.remoteJid,
      { text: errorMsg },
      { quoted: msg }
    )
  }
}

handler.command = ["ytmp3"]
export default handler