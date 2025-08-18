var handler = async (m, { conn, command, text }) => {
  let user1, user2
  let mentioned = m.mentionedJid || []

  if (mentioned.length >= 2) {
    // 📌 Si hay 2 menciones
    user1 = await conn.getName(mentioned[0]) || '@' + mentioned[0].split('@')[0]
    user2 = await conn.getName(mentioned[1]) || '@' + mentioned[1].split('@')[0]
  } else if (text) {
    // 📌 Si no hay menciones, usar texto normal
    let [first, ...rest] = text.split(' ')
    user1 = first
    user2 = rest.join(' ')
  }

  if (!user1 || !user2) {
    throw `🍭 𝙀𝙎𝘾𝙍𝙄𝘽𝙀 𝙀𝙇 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀 𝘿𝙊𝙎 𝙋𝙀𝙍𝙎𝙊𝙉𝘼𝙎 𝙊 𝙀𝙏𝙄𝙌𝙐𝙀𝙏𝘼𝙇𝙊𝙎 𝙋𝘼𝙍𝘼 𝘾𝘼𝙇𝘾𝙐𝙇𝘼𝙍 𝙎𝙐 𝘼𝙈𝙊𝙍.`
  }

  let porcentaje = Math.floor(Math.random() * 100)

  let love = `
━━━━━━━━━━━━━━━
❤️ *${user1}* 𝙏𝙐 𝙊𝙋𝙊𝙍𝙏𝙐𝙉𝙄𝘿𝘼𝘿 𝘿𝙀 𝙀𝙉𝘼𝙈𝙊𝙍𝘼𝙍𝙏𝙀 𝘿𝙀 *${user2}* 𝙀𝙎 𝘿𝙀 *${porcentaje}%* 👩🏻‍❤️‍👨🏻
━━━━━━━━━━━━━━━
`.trim()

  await conn.sendMessage(m.chat, {
    text: love,
    mentions: mentioned // ✅ aún los menciona, pero muestra su nombre
  }, { quoted: m })
}

handler.help = ['love', 'ship']
handler.tags = ['fun']
handler.command = /^(enamorar|ship)$/i

export default handler