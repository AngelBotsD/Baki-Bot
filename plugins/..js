import fetch from 'node-fetch'

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`✳️ Usa: *${usedPrefix + command} <IP o dominio>*\nEj: *.${command} 8.8.8.8*`)

  try {
    let res = await fetch(`http://ip-api.com/json/${args[0]}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,isp,org,timezone,query`)
    let json = await res.json()

    if (json.status !== 'success') throw json.message

    let gmapLink = `https://www.google.com/maps?q=${json.lat},${json.lon}`

    let texto = `
🌐 *Información de IP*

🧠 *IP:* ${json.query}
🏙️ *Ciudad:* ${json.city}
🌎 *Región:* ${json.regionName}
🇺🇸 *País:* ${json.country} (${json.countryCode})
📡 *ISP:* ${json.isp}
🏢 *Organización:* ${json.org}
🛰️ *Latitud:* ${json.lat}
🛰️ *Longitud:* ${json.lon}
⏰ *Zona Horaria:* ${json.timezone}

📍 *Dirección aproximada:* ${gmapLink}
`.trim()

    await conn.sendMessage(m.chat, {
      location: {
        degreesLatitude: json.lat,
        degreesLongitude: json.lon
      },
      caption: texto
    }, { quoted: m })

  } catch (e) {
    m.reply(`❌ Error al obtener la IP\n\n${e}`)
  }
}

handler.help = ['ip']
handler.tags = ['tools']
handler.command = ['ip', 'ipinfo']

export default handler