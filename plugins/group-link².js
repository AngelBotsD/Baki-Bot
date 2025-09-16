import fetch from 'node-fetch'

var handler = async (m, { conn, isAdmin }) => {
  try {
    if (!m.isGroup) return global.dfail?.('group', m, conn)
    if (!isAdmin) return global.dfail?.('admin', m, conn)

    let link = '🗡️ https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
    let ppUrl = await conn.profilePictureUrl(m.chat, 'image').catch(() => null)

    if (ppUrl) {
      await conn.sendMessage(
        m.chat,
        { image: { url: ppUrl }, caption: link },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        { text: link },
        { quoted: m }
      )
    }

  } catch (error) {
    console.error(error)
    return global.dfail?.('admin', m, conn)
  }
}

handler.customPrefix = /^(\.link|link)$/i
handler.command = new RegExp
handler.group = true
handler.admin = true

export default handler