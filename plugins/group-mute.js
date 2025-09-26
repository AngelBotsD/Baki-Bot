import fetch from 'node-fetch'

let mutedUsers = new Set()

let handler = async (m, { conn, command, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail?.('group', m, conn)
  if (!isAdmin && !isOwner) return global.dfail?.('admin', m, conn)
  if (!isBotAdmin) return global.dfail?.('botAdmin', m, conn)

  const user = m.quoted?.sender || m.mentionedJid?.[0]
  if (!user) return m.reply('⚠️ Usa: .mute @usuario o responde a su mensaje.')
  if (user === m.sender) return m.reply('❌ No puedes mutearte a ti mismo.')
  if (user === conn.user.jid) return m.reply('🤖 No puedes mutear al bot.')
  if (user === global.owner) return m.reply('👑 No puedes mutear al owner.')

  const thumbnailUrl = command === 'mute'
    ? 'https://telegra.ph/file/f8324d9798fa2ed2317bc.png'
    : 'https://telegra.ph/file/aea704d0b242b8c41bf15.png'
  const thumbBuffer = await fetch(thumbnailUrl).then(res => res.buffer())

  const preview = {
    key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: m.chat },
    message: {
      locationMessage: {
        name: command === 'mute' ? 'Usuario mutado' : 'Usuario desmuteado',
        jpegThumbnail: thumbBuffer
      }
    }
  }

  if (command === 'mute') {
    mutedUsers.add(user)
    await conn.sendMessage(
      m.chat,
      { text: '*Usuario mutado - Sus mensajes serán eliminados*' },
      { quoted: preview, mentions: [user] }
    )
  } else {
    if (!mutedUsers.has(user)) return m.reply('⚠️ Ese usuario no está muteado.')
    mutedUsers.delete(user)
    await conn.sendMessage(
      m.chat,
      { text: '*Usuario desmuteado - Sus mensajes ya no serán eliminados*' },
      { quoted: preview, mentions: [user] }
    )
  }
}

handler.before = async (m, { conn }) => {
  if (!m.isGroup || m.fromMe) return
  const user = m.sender

  // Borrado instantáneo al ritmo del spam
  if (mutedUsers.has(user)) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (e) {
      console.error('Error eliminando mensaje:', e)
    }
  }
}

handler.help = ['mute @usuario', 'unmute @usuario']
handler.tags = ['group']
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true

export default handler