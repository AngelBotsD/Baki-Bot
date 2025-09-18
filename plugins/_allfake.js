import fetch from 'node-fetch'

export async function before(m, { conn }) {
  let img = await (await fetch('https://files.catbox.moe/jfov52.jpg')).buffer()

  // Fake normal (con thumbnail directo, visible en WhatsApp normal y Business)
  global.fake = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "",
        serverMessageId: 100,
        newsletterName: '',
      },
      externalAdReply: {
        showAdAttribution: true,
        title: botname,
        body: 'Hola',
        previewType: "PHOTO",
        thumbnailUrl: 'https://files.catbox.moe/jfov52.jpg',
        sourceUrl: canal,
        mediaType: 1,
        renderLargerThumbnail: false,
        thumbnail: img, // 👈 Forzamos que se vea en WA normal
        jpegThumbnail: img // 👈 Alternativa, asegura compatibilidad
      }
    }
  }

  // adReply con imagen directa también
  global.adReply = {
    contextInfo: { 
      forwardingScore: 9999, 
      isForwarded: false, 
      externalAdReply: {
        showAdAttribution: true,
        title: botname,
        body: textbot,
        previewType: "PHOTO",
        sourceUrl: canal,
        mediaType: 1,
        renderLargerThumbnail: true,
        thumbnail: img, // 👈 visible en normal
        jpegThumbnail: img
      }
    }
  }

  // Canal
  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "",
        serverMessageId: 100,
        newsletterName: '',
      },
      externalAdReply: { 
        showAdAttribution: true,
        title: '𝗕𝗔𝗞𝗜 - 𝗕𝗢𝗧',
        body: '',
        previewType: "PHOTO",
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: false,
        thumbnail: img, // 👈 se verá igual
        jpegThumbnail: img
      }
    }
  }
}