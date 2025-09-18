import fetch from "node-fetch"

const imgUrl = 'https://files.catbox.moe/jfov52.jpg'
const thumb = await (await fetch(imgUrl)).buffer()

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
      title: '𝗕𝗨𝗨 - 𝘽𝙊𝙏',
      body: '',
      previewType: "PHOTO",
      thumbnail: thumb,   // 👈 buffer desde la URL
      sourceUrl: canal,   // 👈 tu link clickeable
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }
}