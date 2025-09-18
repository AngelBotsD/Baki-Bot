import fs from "fs"

const thumbPath = './src/img/catalogo.jpg'
const thumb = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null

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
      thumbnail: thumb,   // 👈 buffer local
      sourceUrl: canal,   // 👈 tu link clickeable
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }
}