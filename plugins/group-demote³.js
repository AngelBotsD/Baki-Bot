let handler = async (m, { conn }) => {
  const body = m.text?.trim()
  let user

  // Si hay alguien mencionado
  if (m.mentionedJid && m.mentionedJid.length) {
    user = m.mentionedJid[0]
  } 
  // Si es un reply
  else if (/^\.?promote$/i.test(body) && m.quoted) {
    user = m.quoted.sender
  } 
  else return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })

  user = user.trim()
  const metadata = await conn.groupMetadata(m.chat)
  const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id)

  if (admins.includes(user)) return

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {}
}

handler.customPrefix = /^\.?(promote)$/i
handler.command = new RegExp()

export default handler