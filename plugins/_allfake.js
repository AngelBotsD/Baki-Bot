import fetch from 'node-fetch'

export async function before(m, { conn }) {
    // Descargamos la imagen que servirá como "thumbnail"
    let img = await (await fetch('https://files.catbox.moe/jfov52.jpg')).buffer()

    // Mensaje fake que se enviará con imagen + texto
    global.fake = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "",
                serverMessageId: 100,
                newsletterName: '',
            },
            // Mandamos la imagen directamente
            thumbnail: img,
            jpegThumbnail: img,
        },
        caption: 'Hola', // Texto que quieras mostrar
        image: img // Esto fuerza que se vea en WhatsApp normal y Business
    }

    // adReply con la misma lógica
    global.adReply = {
        contextInfo: {
            forwardingScore: 9999,
            isForwarded: false,
            thumbnail: img,
            jpegThumbnail: img,
        },
        caption: textbot,
        image: img,
    }

    // Canal con misma compatibilidad
    global.rcanal = {
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "",
                serverMessageId: 100,
                newsletterName: '',
            },
            thumbnail: img,
            jpegThumbnail: img,
        },
        caption: '𝗕𝗔𝗞𝗜 - 𝗕𝗢𝗧', 
        image: img,
    }
}