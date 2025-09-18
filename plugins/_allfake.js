import fetch from 'node-fetch'

export async function before(m, { conn }) {
    // Descargamos la imagen desde la URL
    const imgUrl = 'https://files.catbox.moe/jfov52.jpg'
    const thumb = await (await fetch(imgUrl)).buffer()

    // Mensaje fake
    global.fake = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "",
                serverMessageId: 100,
                newsletterName: '',
            },
            externalAdReply: {
                title: botname,
                body: 'Hola',
                thumbnail: thumb,  // 👈 Funciona en WA normal y Business
                sourceUrl: canal
            }
        }
    }

    // adReply
    global.adReply = {
        contextInfo: {
            forwardingScore: 9999,
            isForwarded: false,
            externalAdReply: {
                title: botname,
                body: textbot,
                thumbnail: thumb, // 👈 Funciona en WA normal y Business
                sourceUrl: canal
            }
        }
    }

    // rcanal
    global.rcanal = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "",
                serverMessageId: 100,
                newsletterName: '',
            },
            externalAdReply: {
                title: '𝗕𝗔𝗞𝗜 - 𝗕𝗢𝗧',
                body: '',
                thumbnail: thumb, // 👈 Funciona en WA normal y Business
                sourceUrl: '',
                showAdAttribution: true
            }
        }
    }
}