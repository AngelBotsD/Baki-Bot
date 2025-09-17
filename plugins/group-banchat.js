let handler = async (m, { conn, isAdmin, isROwner }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    global.db.data.chats[m.chat].isBanned = true
    m.reply('> bueno jefecito, me iré')
}
handler.help = ['banearbot']
handler.tags = ['group']
handler.customPrefix = /^(\apagate bot de mierda|.banchat)$/i
handler.command = new RegExp
handler.group = true 
handler.owner = true
export default handler

let before = async (m, { isGroup }) => {
    if (isGroup) {
        let chat = global.db.data.chats[m.chat]
        if (chat.isBanned === undefined) {
            chat.isBanned = true
        }
    }
}
export { before }