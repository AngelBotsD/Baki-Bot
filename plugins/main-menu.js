import fs from 'fs'

let handler = async (m, { isPrems, conn }) => {
  m.react('🌐')

  // Imagen local
  let imgPath = './src/img/catalogo.jpg'
  let imgBuffer = fs.readFileSync(imgPath)

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
┗━━━━━━━━━━━━━━┛
...
(👉 aquí va el resto de tu menú completo)
`

  await conn.sendFile(
    m.chat,
    imgBuffer,
    'menu.jpg',
    texto,
    m,
    null,
    {
      contextInfo: {
        externalAdReply: {
          title: "𝐀𝐧𝐠𝐞𝐥 𝐁𝐨𝐭 𝐃𝐞𝐥𝐚𝐲",
          body: "𝐀𝐧𝐠𝐞𝐥 𝐁𝐨𝐭 𝐃𝐞𝐥𝐚𝐲",
          thumbnail: imgBuffer, // 👈 ahora usa tu imagen local
          sourceUrl: '',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }
  )

  global.db.data.users[m.sender].lastcofre = new Date * 1
}

handler.command = ['menu', 'menú', 'multimenu', 'help', 'comandos', 'ayuda']
export default handler