import axios from 'axios'
const { proto } = (await import("@whiskeysockets/baileys")).default

let handler = async (message, { conn, text, usedPrefix, command }) => {
    if (!text) 
        return conn.reply(message.chat, `📄 Por favor, ingrese lo que desea buscar en TikTok.`, message)

    const rwait = '⏳'
    const done = '✅'

    // Función para mezclar un array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
        }
    }

    try {
        await message.react(rwait)
        await conn.reply(message.chat, `📄 Buscando y descargando videos, espere un momento...`, message)

        // Llamada a la API
        const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)
        let searchResults = response.data

        if (!searchResults || searchResults.length === 0)
            return conn.reply(message.chat, `❌ No se encontraron resultados para "${text}"`, message)

        shuffleArray(searchResults)
        const selectedResults = searchResults.slice(0, 7) // máximo 7 videos

        // Enviar cada video individualmente
        for (let result of selectedResults) {
            await conn.sendMessage(
                message.chat,
                {
                    video: { url: result.nowm },
                    caption: `📄 ${result.title}\n🔗 TikTok: ${result.url || 'No disponible'}`
                },
                { quoted: message }
            )
        }

        await message.react(done)

    } catch (error) {
        console.error(error)
        await conn.reply(message.chat, `❌ Ocurrió un error:\n${error.toString()}`, message)
    }
}

handler.help = ['tiktoksearch <txt>']
handler.tags = ['search']
handler.command = ['tiktoksearch', 'ttss', 'tiktoks']

export default handler