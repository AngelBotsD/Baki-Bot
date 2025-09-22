import axios from 'axios'
const { proto, generateWAMessageFromContent } = (await import("@whiskeysockets/baileys")).default

let handler = async (message, { conn, text, usedPrefix, command }) => {
    if (!text) 
        return conn.reply(message.chat, `📄 Por favor, ingrese lo que desea buscar en TikTok.`, message)

    const rwait = '⏳'  // emoji de esperando
    const done = '✅'   // emoji de completado
    const author = 'Su Bot' // texto para el footer

    // Función para crear videoMessage
    async function createVideoMessage(url) {
        const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer })
        return videoMessage
    }

    // Función para mezclar un array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
        }
    }

    try {
        await message.react(rwait)
        await conn.reply(message.chat, `📄 Descargando su video, espere un momento...`, message)

        // Consulta a la API
        const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)
        let searchResults = response.data

        shuffleArray(searchResults)
        let selectedResults = searchResults.slice(0, 7) // tomar hasta 7 resultados

        // Construir tarjetas del carousel
        let results = []
        for (let result of selectedResults) {
            results.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: author }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: result.title || '',
                    hasMediaAttachment: true,
                    videoMessage: await createVideoMessage(result.nowm)
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
            })
        }

        // Crear mensaje de carousel
        const responseMessage = generateWAMessageFromContent(message.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ text: `📄 Resultado de: ${text}` }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: 'TikTok - Búsqueda' }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: results })
                    })
                }
            }
        }, { quoted: message })

        await message.react(done)
        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id })

    } catch (error) {
        await conn.reply(message.chat, `❌ Ocurrió un error:\n${error.toString()}`, message)
    }
}

handler.help = ['tiktoksearch <txt>']
handler.tags = ['search']
handler.command = ['tiktoksearch', 'ttss', 'tiktoks']

export default handler