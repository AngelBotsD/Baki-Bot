import fetch from 'node-fetch'

var handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  try {
    // Validaciones simplificadas
    if (!m.isGroup) return;
    if (!isAdmin && !isOwner) return global.dfail?.('admin', m, conn);

    let link
    try {
      link = '🗡️ https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
    } catch (error) {
      console.error(error)
      return; // simplemente termina si hay error al obtener el link
    }

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

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (error) {
    console.error(error)
  }
}

handler.customPrefix = /^\.?(link)$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;
export default handler