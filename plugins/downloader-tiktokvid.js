import axios from "axios"
import yts from "yt-search"

const owners = ["639301488272@s.whatsapp.net", "521YYYYYYYYY@s.whatsapp.net"]

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

  let title = "Desconocido"
  let artista = "Desconocido"
  let duration = "?"
  let thumbnail = `https://img.youtube.com/vi/${videoMatch[1]}/hqdefault.jpg`

  try {
    const info = await yts({ query: videoUrl })
    if (info?.videos?.length > 0) {
      const video = info.videos[0]
      title = video.title || title
      artista = video.author?.name || artista
      duration = video.timestamp || duration
      thumbnail = video.thumbnail || thumbnail
    }
  } catch {}

  const tryApi = async (apiName, url, controller) => {
    try {
      const r = await axios.get(url, { timeout: 10000, signal: controller.signal })
      const audioUrl = r.data?.result?.url || r.data?.data?.url
      if (audioUrl) return { url: audioUrl, api: apiName }
      throw new Error(`${apiName}: No entregó URL válido`)
    } catch (err) {
      throw new Error(`${apiName}: ${err.message}`)
    }
  }

  const apis = [
    (c) => tryApi("Api 1M", `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&apikey=may-0595dca2`, c),
    (c) => tryApi("Api 2A", `https://api-adonix.ultraplus.click/download/ytmp3?apikey=AdonixKeyz11c2f6197&url=${encodeURIComponent(videoUrl)}`, c),
    (c) => tryApi("Api 3F", `https://api-adonix.ultraplus.click/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(videoUrl)}`, c)
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
        if (attempt < 3) {
          await conn.sendMessage(msg.key.remoteJid, { react: { text: "🔄", key: msg.key } })
        }
        if (attempt === 3) throw lastError
      }
    }
  }

  try {
    const winner = await tryDownload()
    const audioDownloadUrl = winner.url

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: thumbnail },
        caption: `
> 𝚅𝙸𝙳𝙴𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁

⭒ ִֶָ७ ꯭🎵˙⋆｡ - 𝚃𝚒́𝚝𝚞𝚕𝚘: ${title}
⭒ ִֶָ७ ꯭🎤˙⋆｡ - 𝙰𝚛𝚝𝚒𝚜𝚝𝚊: ${artista}
⭒ ִֶָ७ ꯭🕑˙⋆｡ - 𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗: ${duration}
⭒ ִֶָ७ ꯭📺˙⋆｡ - 𝙲𝚊𝚕𝚒𝚍𝚊𝚍: 128kbps
⭒ ִֶָ७ ꯭🌐˙⋆｡ - 𝙰𝚙𝚒: ${winner.api}

» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧
» 𝘈𝘎𝘜𝘈𝘙𝘋𝘓𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...

⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻

> \`\`\`© 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓.𝗑𝗒𝗓\`\`\`
`.trim()
      },
      { quoted: msg }
    )

    await conn.sendMessage(
      msg.key.remoteJid,
      {
        audio: { url: audioDownloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      },
      { quoted: msg }
    )

    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } })

  } catch (e) {
    await conn.sendMessage(
      msg.key.remoteJid,
      {
        text: `❌ *Error:* ${e.message || "Ocurrió un problema"}\n\n🔸 Posibles soluciones:\n• Verifica el enlace de YouTube\n• Intenta con otro link\n• Prueba más tarde`
      },
      { quoted: msg }
    )
  }
}

handler.command = ["ytmp3"]
export default handler