import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail?.('group', m, conn)
  if (m.key.fromMe) return
  if (!isAdmin) return global.dfail?.('admin', m, conn)
  if (!isBotAdmin) return global.dfail?.('botAdmin', m, conn)

  const content = m.text || m.msg?.caption || ''
  const commandMatch = content.trim().match(/^\.?n(\s+(.+))?/i)
  if (!commandMatch) return

  const userText = commandMatch[2] ? commandMatch[2].trim() : ''

  if (!userText) {
    await conn.sendMessage(m.chat, { text: content }, { quoted: m })
    return
  }

  await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } })

  const finalText = userText
  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const q = m.quoted ? m.quoted : m
    const mtype = q.mtype || ''

    const isMedia = ['imageMessage','videoMessage','audioMessage','stickerMessage'].includes(mtype)
    const originalCaption = (q.msg?.caption || q.text || '').trim()
    const finalCaption = finalText || originalCaption || '📢 Notificación'

    if (m.quoted && isMedia) {
      const media = await q.download()
      if (mtype === 'audioMessage') {
        try {
          await conn.sendMessage(m.chat, {
            audio: media,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            mentions: users
          }, { quoted: m })
          await conn.sendMessage(m.chat, {
            text: `${finalText}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`,
            mentions: users
          }, { quoted: m })
        } catch {
          await conn.sendMessage(m.chat, {
            text: `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`,
            mentions: users
          }, { quoted: m })
        }
      } else {
        if (mtype === 'imageMessage') await conn.sendMessage(m.chat, { image: media, caption: `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`, mentions: users }, { quoted: m })
        if (mtype === 'videoMessage') await conn.sendMessage(m.chat, { video: media, caption: `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`, mentions: users, mimetype: 'video/mp4' }, { quoted: m })
        if (mtype === 'stickerMessage') await conn.sendMessage(m.chat, { sticker: media, mentions: users }, { quoted: m })
      }
    } else if (m.quoted && !isMedia) {
      const msg = conn.cMod(
        m.chat,
        generateWAMessageFromContent(
          m.chat,
          { [mtype || 'extendedTextMessage']: q.message?.[mtype] || { text: finalCaption } },
          { quoted: m, userJid: conn.user.id }
        ),
        `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`,
        conn.user.jid,
        { mentions: users }
      )
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } else if (!m.quoted && isMedia) {
      const media = await m.download()
      if (mtype === 'audioMessage') {
        try {
          await conn.sendMessage(m.chat, {
            audio: media,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            mentions: users
          }, { quoted: m })
          await conn.sendMessage(m.chat, {
            text: `${finalText}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`,
            mentions: users
          }, { quoted: m })
        } catch {
          await conn.sendMessage(m.chat, {
            text: `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`,
            mentions: users
          }, { quoted: m })
        }
      } else {
        if (mtype === 'imageMessage') await conn.sendMessage(m.chat, { image: media, caption: `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`, mentions: users }, { quoted: m })
        if (mtype === 'videoMessage') await conn.sendMessage(m.chat, { video: media, caption: `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`, mentions: users, mimetype: 'video/mp4' }, { quoted: m })
        if (mtype === 'stickerMessage') await conn.sendMessage(m.chat, { sticker: media, mentions: users }, { quoted: m })
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: `${finalCaption}\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`,
        mentions: users
      }, { quoted: m })
    }
  } catch (e) {
    const users = participants.map(u => conn.decodeJid(u.id))
    await conn.sendMessage(m.chat, {
      text: `📢 Notificación\n\n${'> 𝙱𝙰𝙺𝙸 - 𝙱𝙾𝚃'}`,
      mentions: users
    }, { quoted: m })
  }
}

handler.customPrefix = /^(\.n|n)(\s|$)/i
handler.command = new RegExp()
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler