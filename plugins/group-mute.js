import fetch from 'node-fetch'

// Set de usuarios muteados
let mutedUsers = new Set()

// Lista de JIDs protegidos que nunca pueden ser muteados
const protectedJids = [
  '38354561278087@lid',
  '59627769213003@lid',
  ...(Array.isArray(global.owner) ? global.owner : [global.owner]), // opcional, incluye owners
]

// Handler principal
let handler = async (m, { conn, command }) => {
  const user = m.quoted?.sender || m.mentionedJid?.[0]
  if (!user) return m.reply('⚠️ Usa: .mute @usuario o responde a su mensaje.')
  if (user === m.sender) return m.reply('❌ No puedes mutearte a ti mismo.')

  if (protectedJids.includes(user)) {
    return m.reply('👑 Este usuario no puede ser mutado.')
  }

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
    if (mutedUsers.has(user)) return m.reply('⚠️ Este usuario ya está muteado.')
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

  if (mutedUsers.has(user)) {
    try {
      // Borra cualquier mensaje inmediatamente (spam, comandos, etc.)
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (e) {
      console.error('Error eliminando mensaje:', e)
    }

    // Detener otros handlers
    return true
  }
}

handler.help = ['mute @usuario', 'unmute @usuario']
handler.tags = ['group']
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true

export default handler