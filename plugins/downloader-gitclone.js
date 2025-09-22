import axios from 'axios'
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} = (await import("@whiskeysockets/baileys")).default

let handler = async (message, { conn, text }) => {
  const avatar = 'https://qu.ax/XKFEL.jpg' 
  const dev = 'xd' 
  const redes = 'https://tusitio.com' 

  if (!text) {
    return conn.reply(message.chat, "🥷🏻 Ingresa un texto para buscar en TikTok.", message)
  }

  try {
    // mensaje de espera ⌛
    conn.sendMessage(message.chat, {
      text: '⌛ *Buscando en TikTok...*',
      contextInfo: { externalAdReply: { title: 'Descargas', body: dev, thumbnailUrl: avatar, sourceUrl: redes, mediaType: 1, showAdAttribution: true }}
    }, { quoted: message })

    let { data } = await axios.get("https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=" + text)
    let searchResults = data.data.slice(0, 6) // solo 6 resultados, + rápido

    // crear todos los videoMessage en paralelo
    const videoMsgs = await Promise.all(
      searchResults.map(r => generateWAMessageContent({ video: { url: r.nowm } }, { upload: conn.waUploadToServer }))
    )

    let cards = searchResults.map((r, i) => ({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: dev }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: r.title,
        hasMediaAttachment: true,
        videoMessage: videoMsgs[i].videoMessage
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
    }))

    const msg = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ text: "🥷🏻 RESULTADOS DE: " + text }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: dev }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
          })
        }
      }
    }, { quoted: message })

    await conn.relayMessage(message.chat, msg.message, { messageId: msg.key.id })

  } catch (error) {
    conn.reply(message.chat, `⚠︎ *ERROR:* ${error.message}`, message)
  }
}

handler.help = ["tiktoksearch <txt>"]
handler.group = true
handler.tags = ["buscador"]
handler.command = ["tiktoksearch", "ttss", "tiktoks"]

export default handler