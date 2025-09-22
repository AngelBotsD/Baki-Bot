import axios from "axios"

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) throw `✳️ Ejemplo de uso:\n${usedPrefix + command} Yerzy y Los Menores`

  try {
    // Aviso inicial
    await conn.sendMessage(m.chat, { text: "📂 Descargando sus videos, espere un momento..." }, { quoted: m })

    // API URL
    let url = `https://mayapi.ooguy.com/tiktoks?query=${encodeURIComponent(text)}&apikey=may-0595dca2`
    let res = await axios.get(url)

    if (!res.data || !res.data.result || res.data.result.length === 0) {
      throw "⚠️ No se encontraron resultados en TikTok."
    }

    // Tomamos solo los primeros 7 resultados
    let results = res.data.result.slice(0, 7)

    // Aviso de búsqueda
    await conn.sendMessage(m.chat, { 
      text: `🔎 Resultado de: *${text}*\nTiktok - Busqueda` 
    }, { quoted: m })

    for (let video of results) {
      let titulo = video.title || "Sin título"
      let autor = video.author || "Desconocido"
      let hashtags = video.hashtags?.join(" ") || ""
      let link = video.url || null

      if (!link) continue

      let caption = `${hashtags}`

      // Enviar cada video con su caption (hashtags)
      await conn.sendMessage(m.chat, {
        video: { url: link },
        caption: caption
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    throw "❌ Error al obtener los videos de TikTok."
  }
}

handler.help = ["tiktoksearch <texto>"]
handler.tags = ["buscador"]
handler.command = ["ttse"]

export default handler