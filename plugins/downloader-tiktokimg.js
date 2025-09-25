import axios from "axios"
import yts from "yt-search"
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

  // Filtra enlaces válidos y captura el ID
  const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);

  if (!videoMatch) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Solo se permite un enlace de YouTube válido." },
      { quoted: msg }
    )
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoMatch[1]}`

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "🕒", key: msg.key } })

  const res = await yts({ query: videoUrl, hl: "es", gl: "MX" })
  const song = res.videos[0]
  if (!song) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    )
  }

  const { url: videoUrlReal, title, timestamp: duration, author, thumbnail } = song
  const artista = author.name

  let audioDownloadUrl = null
  let apiUsada = "Desconocida"

  const tryDownload = async () => {
    const tryApi = (apiName, urlBuilder) => new Promise(async (resolve, reject) => {
      try {
        const apiUrl = urlBuilder()
        const r = await axios.get(apiUrl, { timeout: 7000 })
        if (r.data?.status && (r.data?.result?.url || r.data?.data?.url)) {
          resolve({
            url: r.data.result?.url || r.data.data?.url,
            api: apiName
          })
          return
        }
        reject(new Error(`${apiName}: No entregó un URL válido`))
      } catch (err) {
        if (!err.message.toLowerCase().includes("aborted")) {
          reject(new Error(`${apiName}: ${err.message}`))
        }
      }
    })

    // **Se ejecutan todas en paralelo**
    const mayApi = tryApi("Api 1M", () => `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrlReal)}&type=mp3&apikey=may-0595dca2`)
    const adonixApi = tryApi("Api 2A", () => `https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrlReal)}`)
    const adofreeApi = tryApi("Api 3F", () => `https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(videoUrlReal)}`)

    // Usamos Promise.any para tomar la primera que responda correctamente
    const winner = await Promise.any([mayApi, adonixApi, adofreeApi])
    return winner
  }

  try {
    const winner = await tryDownload()
    audioDownloadUrl = winner.url
    apiUsada = winner.api

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: thumbnail },
        caption: `
> *𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*

⭒ ִֶָ७ ꯭🎵˙⋆｡ - *𝚃𝚒́𝚝𝚞𝚕𝚘:* ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* 128kbps
⭒ ִֶָ७ ꯭🌐˙⋆｡ - *𝙰𝚙𝚒:* ${apiUsada}

*» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧*
*» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...*

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝗁𝖾𝗋𝗇𝖺𝗻𝖽𝖾𝗓.𝗑𝗒𝗓\`\`\`
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
            fileName: `${title}.mp3`,
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
          fileName: `${title}.mp3`,
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