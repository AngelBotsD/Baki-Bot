let handler = async (m, { conn, usedPrefix, command }) => {

if (!m.quoted) return conn.reply(m.chat, `🧹 Responde al mensaje que deseas eliminar.`)
try {
let delet = m.message.extendedTextMessage.contextInfo.participant
let bang = m.message.extendedTextMessage.contextInfo.stanzaId
return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
 } catch {
return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
}
}
handler.customPrefix = /^\.?(del)$/i;
handler.group = true
handler.admin = true

export default handler