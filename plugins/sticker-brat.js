const handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply(`☁️ 𝘼𝙂𝙍𝙀𝙂𝘼 𝙏𝙀𝙓𝙏𝙊 𝙋𝘼𝙍𝘼 𝙂𝙀𝙉𝙀𝙍𝘼𝙍 𝙀𝙇 𝙎𝙏𝙄𝘾𝙆𝙀𝙍`)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

    const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}`
    await conn.sendMessage(m.chat, {
      sticker: { url },
      packname: "",
      author: "",
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    conn.reply(m.chat, '❌ 𝙀𝙍𝙍𝙊𝙍 𝘼𝙇 𝙂𝙀𝙉𝙀𝙍𝘼𝙍 𝙀𝙇 𝙎𝙏𝙄𝘾𝙆𝙀𝙍', m)
  }
}

handler.command = /^brat$/i
handler.help = ["brat <texto>"]
handler.tags = ["sticker"]

export default handler