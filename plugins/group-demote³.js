let handler = async (m, { conn }) => {
  const body = m.text?.trim()
  let user

  if (/^(promote|\.promote)\s+@/i.test(body)) {
    const mentioned = m.mentionedJid || m.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (!mentioned || !mentioned.length) 
      return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })
    user = mentioned[0]
  } 
  else if (/^(promote|\.promote)$/i.test(body)) {
    user = m.quoted?.sender
    if (!user) 
      return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })
  } else return

  user = user.trim()
  const metadata = await conn.groupMetadata(m.chat)
  const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id)

  if (admins.includes(user)) return

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {}
}

handler.customPrefix = /^\.?(promote)$/i;
handler.command = new RegExp()

export default handler