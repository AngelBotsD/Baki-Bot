const handler = async (m, { conn }) => {
  let menu = `👋🏻 𝖧𝗈𝗅𝖺! 𝖻𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝗈 𝖺𝗅 𝗆𝖾𝗇𝗎𝗀𝗋𝗎𝗉𝗈 𝖽𝖾 *𝖻𝖺𝗄𝗂-𝖡𝗈𝗍 𝖨𝖠* 𝖺𝗾𝗎𝗂́ 𝖾𝗇𝖼𝗈𝗇𝗍𝗋𝖺𝗋𝖺́𝗌 𝗅𝗈𝗌 𝖼𝗈𝗆𝖺𝗇𝖽𝗈𝗌 𝗉𝖺𝗋𝖺 𝗆𝖺𝗇𝗍𝖾𝗇𝖾𝗋 𝗎𝗇 𝗍𝗈𝗍𝖺𝗅 𝗈𝗋𝖽𝖾𝗇 𝖽𝖾 𝗍𝗎́ 𝗀𝗋𝗎𝗉𝗈!

✮,— \`𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖣𝖤 𝖠𝖣𝖬𝖨𝖭𝖲\` .ᐟᨮׁׅ֮.ᐟ
⭒ ִֶָ७ ꯭🍨˙⋆｡ -kick
⭒ ִֶָ७ ꯭🍨˙⋆｡ -link
⭒ ִֶָ७ ꯭🍨˙⋆｡ -promote
⭒ ִֶָ७ ꯭🍨˙⋆｡ -demote
⭒ ִֶָ७ ꯭🍨˙⋆｡ -notify
⭒ ִֶָ७ ꯭🍨˙⋆｡ -todos
⭒ ִֶָ७ ꯭🍨˙⋆｡ -setfoto
⭒ ִֶָ७ ꯭🍨˙⋆｡ -setname
⭒ ִֶָ७ ꯭🍨˙⋆｡ -setinfo
⭒ ִֶָ७ ꯭🍨˙⋆｡ -setwelcome
⭒ ִֶָ७ ꯭🍨˙⋆｡ -setbye
⭒ ִֶָ७ ꯭🍨˙⋆｡ -fantasmas
⭒ ִֶָ७ ꯭🍨˙⋆｡ -fankick
⭒ ִֶָ७ ꯭🍨˙⋆｡ -del 
⭒ ִֶָ७ ꯭🍨˙⋆｡ -mute
⭒ ִֶָ७ ꯭🍨˙⋆｡ -unmute
⭒ ִֶָ७ ꯭🍨˙⋆｡ -abrirgrupo
⭒ ִֶָ७ ꯭🍨˙⋆｡ -cerrargrupo

✮,— \`𝖠𝖢𝖳𝖨𝖵𝖠𝖱/𝖣𝖤𝖲𝖠𝖢𝖳𝖨𝖵𝖠𝖱\` .ᐟᨮׁׅ֮.ᐟ
⭒ ִֶָ७ ꯭🥤˙⋆｡ -on/off welcome
⭒ ִֶָ७ ꯭🥤˙⋆｡ -on/off modoadmin
⭒ ִֶָ७ ꯭🥤˙⋆｡ -on/off antiarabe
⭒ ִֶָ७ ꯭🥤˙⋆｡ -on/off antilink
⭒ ִֶָ७ ꯭🥤˙⋆｡ -on/off nsfw

> © 𝖻𝖺𝗄𝗂-𝖡𝗈𝗍 𝖨𝖠 𝖝 𝗁𝖾𝗋𝗇𝖺𝗇𝖽𝖾𝗓-𝗑𝗒𝗓
`

  await conn.sendMessage(m.chat, {
    react: { text: '🧾', key: m.key }
  })

  await conn.sendMessage(m.chat, {
    image: { url: "https://cdn.russellxz.click/33f7b6d5.jpeg" },
    caption: menu,
    mentions: [m.sender],
    quoted: m
  })
}

handler.customPrefix = /^(\.menu2|menu2|\.menugrupo|menugrupo)$/i
handler.command = new RegExp
export default handler