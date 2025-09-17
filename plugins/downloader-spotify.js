import fetch from 'node-fetch';
import axios from 'axios';

const apis = {
  delirius: 'https://delirius-apiofc.vercel.app/',
  siputzx: 'https://api.siputzx.my.id/api/',
  ryzen: 'https://apidl.asepharyana.cloud/',
  rioo: 'https://restapi.apibotwa.biz.id/',
  random1: 'https://api.agungny.my.id/api/'
};

const handler = async (m, {conn, command, args, text, usedPrefix}) => {

    if (!text) m.reply(`_*[ ⚠️ ] Agrega lo que quieres Descargar en Spotify*_\n\n_Ejemplo:_\n.play Chica Paranormal.`);

    try { 

        let { data } = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=10`);

        if (!data.data || data.data.length === 0) {
            throw `_*[ ⚠️ ] No se encontraron resultados para "${text}" en Spotify.*_`;
        }

        const img = data.data[0].image;
        const url = data.data[0].url;
        const info = `⧁ 𝙏𝙄𝙏𝙐𝙇𝙊
» ${data.data[0].title}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁ 𝗗𝗨𝗥𝗔𝗖𝗜𝗢𝗡
» ${data.data[0].duration}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁  𝘼𝙍𝙏𝙄𝙎𝙏𝘼
» ${data.data[0].artist}

_*🎶 Enviando música...*_`.trim();

        await conn.sendFile(m.chat, img, 'imagen.jpg', info, m);

        //＼／＼／＼／＼／＼／ DESCARGAR ＼／＼／＼／＼／＼／

        try {
            const api1 = `${apis.delirius}download/spotifydl?url=${encodeURIComponent(url)}`;
            const response1 = await fetch(api1);
            const result1 = await response1.json();

            const downloadUrl1 = result1.data.url;
            await conn.sendMessage(m.chat, { audio: { url: downloadUrl1 }, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: null, quoted: m });
        } catch (e1) {

            try {
                const api2 = `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(url)}`;
                const response2 = await fetch(api2);
                const result2 = await response2.json();

                const downloadUrl2 = result2.data.url;
                await conn.sendMessage(m.chat, { audio: { url: downloadUrl2 }, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: null, quoted: m });

            } catch (e2) {

                try {
                    const api3 = `${apis.rioo}api/spotify?url=${encodeURIComponent(url)}`;
                    const response3 = await fetch(api3);
                    const result3 = await response3.json();

                    const downloadUrl3 = result3.data.response;
                    await conn.sendMessage(m.chat, { audio: { url: downloadUrl3 }, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: null, quoted: m });

                } catch (e3) {

                    try {
                        const api4 = `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(url)}`;
                        const response4 = await fetch(api4);
                        const result4 = await response4.json();

                        const downloadUrl4 = result4.link;
                        await conn.sendMessage(m.chat, { audio: { url: downloadUrl4 }, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: null, quoted: m });

                    } catch (e4) {
                        m.reply(`❌ Ocurrió un error al descargar el audio\nError:${e4.message}`);
                    }
                }
            }
        }


    } catch (e) {

        await conn.reply(m.chat, `> Intenta Nuevamente.`, m);
        console.log(e);
    }
};

handler.tags = ['downloader']; 
handler.help = ['spotify'];
handler.command = ['spotify'];
export default handler;