import fetch from 'node-fetch'

const img = await (await fetch('https://files.catbox.moe/jfov52.jpg')).buffer()

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
      thumbnail: img,      // 👈 aquí va el buffer, no la URL
      sourceUrl: canal,    // 👈 tu link clickeable
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }
}