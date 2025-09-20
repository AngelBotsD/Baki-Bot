import fs, { promises } from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
try {
let d = new Date(Date.now() + 3600000)
let locale = 'es'
let week = d.toLocaleDateString(locale, { weekday: 'long' })
let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
let time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
let _uptime = process.uptime() * 1000
let uptime = clockString(_uptime)
let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length 
let more = String.fromCharCode(8206)
let readMore = more.repeat(850)   
let taguser = conn.getName(m.sender)
let user = global.db.data.users[m.sender]

let fkontak = { 
  "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, 
  "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, 
  "participant": "0@s.whatsapp.net" 
}

let menu = `👋🏻 𝖧𝗈𝗅𝖺! 𝖻𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺𝗅 𝗆𝖾𝗇𝗎𝗀𝗋𝗎𝗉𝗈 𝖽𝖾 *𝖻𝖺𝗄𝗂-𝖡𝗈𝗍 𝖨𝖠* 𝖺𝗊𝗎𝗂́ 𝖾𝗇𝖼𝗈𝗇𝗍𝗋𝖺𝗋𝖺́𝗌 𝗅𝗈𝗌 𝖼𝗈𝗆𝖺𝗇𝖽𝗈𝗌 𝗉𝖺𝗋𝖺 𝗆𝖺𝗇𝗍𝖾𝗇𝖾𝗋 𝗎𝗇 𝗍𝗈𝗍𝖺𝗅 𝗈𝗋𝖽𝖾𝗇 𝖾𝗇 𝗍𝗎𝗌 𝖼𝗈𝗆𝗉𝖾𝗍𝗂𝗍𝗂𝗏𝗈𝗌!

» 𝗟𝗜𝗦𝗧𝗔𝗦 𝐄𝐄𝐔𝐔
⭒ ִֶָ७ ꯭🥤˙⋆｡ -4𝘷𝘴4 𝙝𝙤𝙧𝙖 𝙮 𝙥𝙖𝙞𝙨
⭒ ִֶָ७ ꯭🥤˙⋆｡ -6𝘷𝘴6 𝙝𝙤𝙧𝙖 𝙮 𝙥𝙖𝙞𝙨
⭒ ִֶָ७ ꯭🥤˙⋆｡ -8𝘷𝘴8 𝙝𝙤𝙧𝙖 𝙮 𝙥𝙖𝙞𝙨
⭒ ִֶָ७ ꯭🥤˙⋆｡ -12𝘷𝘴12 𝙝𝙤𝙧𝙖 𝙮 𝙥𝙖𝙞𝙨
⭒ ִֶָ७ ꯭🥤˙⋆｡ -16𝘷𝘴16 𝙝𝙤𝙧𝙖 𝙮 𝙥𝙖𝙞𝙨
⭒ ִֶָ७ ꯭🥤˙⋆｡ -20𝘷𝘴20 𝙝𝙤𝙧𝙖 𝙮 𝙥𝙖𝙞𝙨
⭒ ִֶָ७ ꯭🥤˙⋆｡ -24𝘷𝘴24 𝙝𝙤𝙧𝙖 𝙮 𝙥𝙖𝙞𝙨
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘪𝘯𝘵𝘦𝘳𝘯𝘢4𝘷𝘴4 𝙝𝙤𝙳
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘪𝘯𝘵𝘦𝘳𝘯𝘢6𝘷𝘴6 𝙝𝙤𝙳
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘴𝘤𝘳𝘪𝘮
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘴𝘤𝘳𝘪𝘮𝘥𝘶𝘰
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘮𝘢𝘱𝘢𝘤𝘶𝘢𝘥𝘳𝘪𝘭𝘢𝘵𝘦𝘳𝘰
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘭𝘪𝘴𝘵𝘢𝘤𝘶𝘢𝘥𝘳𝘪𝘭𝘢𝘵𝘦𝘳𝘰
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘮𝘢𝘱𝘢𝘩𝘦𝘹𝘢𝘨𝘰𝘯𝘢𝘭
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘭𝘪𝘴𝘵𝘢𝘩𝘦𝘹𝘢𝘨𝘰𝘯𝘢𝘭 
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘱𝘰𝘥𝘪𝘰𝘤𝘶𝘢𝘥𝘳𝘪
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝘷𝘦𝘴𝘵𝘪𝘮𝘦𝘯𝘤𝘶𝘢𝘥𝘳𝘪

» 𝗠𝗔𝗣𝗔𝗦 𝗙𝗥𝗘𝗘 𝗙𝗜𝗥𝗘
⭒ ִֶָ७ ꯭🏞️˙⋆｡ -𝖻𝖾𝗋𝗆𝗎𝖽𝖺
⭒ ִֶָ७ ꯭🌅˙⋆｡ -𝗉𝗎𝗋𝗀𝖺𝗍𝗈𝗋𝗂𝗈
⭒ ִֶָ७ ꯭🏜️˙⋆｡ -𝗄𝖺𝗅𝖺𝗁𝖺𝗋𝗂
⭒ ִֶָ७ ꯭🌄˙⋆｡ -𝗇𝖾𝗑𝗍𝖾𝗋𝗋𝖺
⭒ ִֶָ७ ꯭🏞️˙⋆｡ -𝖺𝗅𝗉𝖾𝗌
╰━━━━━━⋆★⋆━━━━━━⬣
`.trim()

const vi = ['https://telegra.ph/file/523e4cd6e968fcab7c160.mp4']

try {
await conn.sendMessage(m.chat, { video: { url: vi.getRandom() }, gifPlayback: true, caption: menu, mentions: [m.sender, global.conn.user.jid] }, { quoted: fkontak }) 
} catch (error) {
try {
await conn.sendMessage(m.chat, { image: { url: gataMenu.getRandom() }, caption: menu, mentions: [m.sender, global.conn.user.jid] }, { quoted: fkontak }) 
} catch (error) {
try {
await conn.sendMessage(m.chat, { image: gataImg.getRandom(), caption: menu, mentions: [m.sender, global.conn.user.jid] }, { quoted: fkontak }) 
} catch (error) {
try {
await conn.sendFile(m.chat, imagen5, 'menu.jpg', menu, fkontak, false, { mentions: [m.sender, global.conn.user.jid] })
} catch (error) {
return 
}}}} 

} catch (e) {
console.log(`❗❗ Error en el comando ${usedPrefix + command} ❗❗`)
console.log(e)}}

handler.customPrefix = /menuff|menufreefire/i 
handler.command = new RegExp
handler.exp = 0
export default handler;   

function clockString(ms) {
let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')}