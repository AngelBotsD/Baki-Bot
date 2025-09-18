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
      body: 'Visita nuestro canal: ' + canal, // 👈 link en el texto
      previewType: "PHOTO",
      thumbnail: thumb,   // 👈 buffer local como en kick
      sourceUrl: "",      // vacío para que WA normal dibuje el icono
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}