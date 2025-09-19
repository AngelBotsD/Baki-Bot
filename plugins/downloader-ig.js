import { igdl } from "ruhend-scraper"

let handler = async (m, { args, conn }) => { 
  if (!args[0]) {
    return conn.reply(m.chat, '🔗 *𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚞𝚗 𝚕𝚒𝚗𝚔 𝚍𝚎 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖*', m);
  }

  const url = args[0];
  if (!url.includes('instagram.com')) {
    return conn.reply(m.chat, '𝙴𝚕 𝚟𝚒́𝚍𝚎𝚘 𝚙𝚛𝚘𝚙𝚘𝚛𝚌𝚒𝚘𝚗𝚊𝚍𝚘 𝚗𝚘 𝚎𝚜 𝚍𝚎 𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖', m);
  }

  try {
    await m.react('⏳');
    conn.reply(m.chat, `🕒 *Enviando Video...*`, m, {
      contextInfo: {
        externalAdReply: {
          mediaUrl: null,
          mediaType: 1,
          showAdAttribution: true,
          title: botname,
          body: wm,
          previewType: 0,
          thumbnail: icons,
          sourceUrl: channel
        }
      }
    });

    let res = await igdl(args[0]);
    let data = res.data;

    if (data.length > 0) {
      let media = data[0]; 
      await conn.sendFile(m.chat, media.url, 'instagram.mp4', fkontak);
    } else {
      conn.reply(m.chat, '⚙️ No se encontraron medios en el enlace proporcionado.', m);
    }

  } catch (error) {
    await m.react('❌');
    conn.reply(m.chat, '⚙️ 𝙾𝚌𝚞𝚛𝚛𝚒𝚘́ 𝚞𝚗 𝚎𝚛𝚛𝚘𝚛.', m, fake);
  }
};

handler.command = ['instagram', 'ig'];
handler.tags = ['downloader'];
handler.help = ['instagram', 'ig'];

export default handler;