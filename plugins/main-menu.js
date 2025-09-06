let handler = async (m, { isPrems, conn }) => {
  m.react('🌐')

  let img = 'https://cdn.russellxz.click/fa46d669.jpeg' 
  let texto = `
🪙 𝐌 𝐔 𝐋 𝐓 𝐈 - 𝐌 𝐄 𝐍 𝐔́ 

      「 *📚 𝘐𝘯𝘧𝘰 📚* 」  
┣━━━━━━━━━━━━━━┫
┃⋗ 👤 *.owner*  
┃⋗ 🌟 *.grupos*  
┃⋗ 📜 *.menu*  
┃⋗ 📖 *.menu2*  
┃⋗ 📚 *.menu3* 
┃⋗ 🖇️ *.menu4* 
┃⋗ 🐶 *.menu5*
┃⋗ 🏓 *.ping*  
┃⋗ ⏳ *.runtime*  
┃⋗ 📢 *.reportar*  
┃⋗ 💡 *.sugerencia*
┗━━━━━━━━━━━━━━┛`

  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: texto,
    contextInfo: {
      externalAdReply: {
        title: "𝐀𝐧𝐠𝐞𝐥 𝐁𝐨𝐭 𝐃𝐞𝐥𝐚𝐲",
        body: "𝐀𝐧𝐠𝐞𝐥 𝐁𝐨𝐭 𝐃𝐞𝐥𝐚𝐲",
        thumbnailUrl: img,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }, { quoted: m })

  global.db.data.users[m.sender].lastcofre = new Date * 1
}

handler.command = ['menu', 'menú', 'multimenu', 'help', 'comandos', 'ayuda'] 
export default handler