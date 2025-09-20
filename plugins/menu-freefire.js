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

      let menu = `👋🏻 𝖧𝗈𝗅𝖺! 𝖻𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺𝗅 𝗆𝖾𝗇𝗎𝗀𝗋𝗎𝗉𝗈 𝖽𝖾 *𝖻𝖺𝗄𝗂-𝖡𝗈𝗍 𝖨𝖠* 𝖺𝗾𝗎𝗂́ 𝖾𝗇𝖼𝗈𝗇𝗍𝗋𝖺𝗋𝖺́𝗌 𝗅𝗈𝗌 𝖼𝗈𝗆𝖺𝗇𝖽𝗈𝗌 𝗉𝖺𝗋𝖺 𝗆𝖺𝗇𝗍𝖾𝗇𝖾𝗋 𝗎𝗇 𝗍𝗈𝗍𝖺𝗅 𝗈𝗋𝖽𝖾𝗇 𝖽𝖾 𝗍𝗎́ 𝗀𝗋𝗎𝗉𝗈!

✮,— \`𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖣𝖤 𝖠𝖣𝖬𝖨𝖭𝖲\` .ᐟᨮׁׅ֮.ᐟ
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗄𝗂𝖼𝗄
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝖫𝗂𝗇𝗄
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗉𝗋𝗈𝗆𝗈𝗍𝖾
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝖽𝖾𝗆𝗈𝗍𝖾
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗇𝗈𝗍𝗂𝖿𝗒
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗍𝗈𝖽𝗈𝗌
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗌𝖾𝗍𝖿𝗈𝗍𝗈
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗌𝖾𝗍𝗇𝖺𝗆𝖾
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗌𝖾𝗍𝗂𝗇𝖿𝗈
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗌𝖾𝗍𝗐𝖾𝗅𝖼𝗈𝗆𝖾
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗌𝖾𝗍𝖻𝗒𝖾
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝖿𝖺𝗇𝗍𝖺𝗌𝗆𝖺𝗌
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝖿𝖺𝗇𝗄𝗂𝖼𝗄
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝖽𝖾𝗅 
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗆𝗎𝗍𝖾
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝗎𝗇𝗆𝗎𝗍𝖾
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝖺𝖻𝗋𝗂𝗋𝗀𝗋𝗎𝗉𝗈
⭒ ִֶָ७ ꯭🍨˙⋆｡ -𝖼𝖾𝗋𝗋𝖺𝗋𝗀𝗋𝗎𝗉𝗈


✮,— \`𝖠𝖢𝖳𝖨𝖵𝖠𝖱/𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖱\` .ᐟᨮׁׅ֮.ᐟ
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝗈𝗇/𝗈𝖿𝖿 𝗐𝖾𝗅𝖼𝗈𝗆𝖾
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝗈𝗇/𝗈𝖿𝖿 𝗆𝗈𝖽𝗈𝖺𝖽𝗆𝗂𝗇
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝗈𝗇/𝗈𝖿𝖿 𝖺𝗇𝗍𝗂𝖺𝗋𝖺𝖻𝖾
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝗈𝗇/𝗈𝖿𝖿 𝖺𝗇𝗍𝗂𝗅𝗂𝗇𝗄
⭒ ִֶָ७ ꯭🥤˙⋆｡ -𝗈𝗇/𝗈𝖿𝖿 𝗇𝗌𝖿𝗐

> © 𝖻𝖺𝗄𝗂-𝖡𝗈𝗍 𝖨𝖠 𝖝 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓-𝗑𝗒𝗓`.trim()

    const vi = ['https://telegra.ph/file/523e4cd6e968fcab7c160.mp4']

    try {
      await conn.sendMessage(
        m.chat, 
        { video: { url: vi.getRandom() }, gifPlayback: true, caption: menu, mentions: [m.sender, global.conn.user.jid] }, 
        { quoted: fkontak }
      ) 
    } catch (error) {
      try {
        await conn.sendMessage(
          m.chat, 
          { image: { url: gataMenu.getRandom() }, caption: menu, mentions: [m.sender, global.conn.user.jid] }, 
          { quoted: fkontak }
        ) 
      } catch (error) {
        try {
          await conn.sendMessage(
            m.chat, 
            { image: gataImg.getRandom(), caption: menu, mentions: [m.sender, global.conn.user.jid] }, 
            { quoted: fkontak }
          ) 
        } catch (error) {
          try {
            await conn.sendFile(
              m.chat, 
              imagen5, 
              'menu.jpg', 
              menu, 
              fkontak, 
              false, 
              { mentions: [m.sender, global.conn.user.jid] }
            )
          } catch (error) {
            return 
          }
        }
      }
    }

  } catch (e) {
    console.log(`❗❗ Error en el comando ${usedPrefix + command} ❗❗`)
    console.log(e)
  }
}

handler.customPrefix = /menuff|menufreefire/i 
handler.command = new RegExp
handler.exp = 0
export default handler    

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}