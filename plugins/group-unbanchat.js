let handler = async (m, { conn, isAdmin, isROwner} ) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    global.db.data.chats[m.chat].isBanned = false
    m.reply('🔓 Bot activo en este grupo.')   
}
handler.help = ['desbanearbot']
handler.tags = ['group']
handler.customPrefix = /^(\.unbanchat|vuelve bot pendejo)$/i
handler.command = new RegExp
handler.group = true 
handler.owner = true
export default handler
