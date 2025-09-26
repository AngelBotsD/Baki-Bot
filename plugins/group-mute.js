import fetch from 'node-fetch'

let mutedUsers = new Set()

let handler = async (m, { conn, command }) => {
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
      { text: '*Usuario mutado - Todos sus mensajes y comandos serán bloqueados*' },
      { quoted: preview, mentions: [user] }
    )
  } else {
    if (!mutedUsers.has(user)) return m.reply('⚠️ Ese usuario no está muteado.')
    mutedUsers.delete(user)
    await conn.sendMessage(
      m.chat,
      { text: '*Usuario desmuteado - Ya puede usar el bot normalmente*' },
      { quoted: preview, mentions: [user] }
    )
  }
}

// Antes de procesar cualquier mensaje
handler.before = async (m, { conn }) => {
  if (!m.isGroup || m.fromMe) return
  const user = m.sender

  // Si está muteado → borrar mensajes normales y comandos
  if (mutedUsers.has(user)) {
    try {
      // Si es comando, lo bloqueamos
      if (m.text && m.text.startsWith(global.prefix || '.')) {
        return !1 // no deja ejecutar nada
      }
      // Borrar mensaje normal
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

export default handler