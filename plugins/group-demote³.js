let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail?.('group', m, conn)
  if (!isAdmin) return global.dfail?.('admin', m, conn)
  if (!isBotAdmin) return global.dfail?.('botAdmin', m, conn)
  if (!m.sender) return

  const body = m.text?.trim()
  let user
  let action

  if (/^(promote|\.promote)\s+@/i.test(body)) {
    const mentioned = m.mentionedJid || m.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (!mentioned || !mentioned.length) 
      return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })
    user = mentioned[0]
    action = 'promote'
  } else if (/^(promote|\.promote)$/i.test(body)) {
    user = m.quoted?.sender
    if (!user) 
      return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })
    action = 'promote'
  } else if (/^(demote|\.demote)\s+@/i.test(body)) {
    const mentioned = m.mentionedJid || m.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (!mentioned || !mentioned.length) 
      return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })
    user = mentioned[0]
    action = 'demote'
  } else if (/^(demote|\.demote)$/i.test(body)) {
    user = m.quoted?.sender
    if (!user) 
      return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })
    action = 'demote'
  } else return

  user = user.trim()
  const metadata = await conn.groupMetadata(m.chat)
  const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id)

  if (action === 'promote' && admins.includes(user)) return
  if (action === 'demote' && !admins.includes(user)) return

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], action)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {}
}

handler.customPrefix = /^(promote|\.promote|demote|\.demote)/i
handler.command = new RegExp()
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler