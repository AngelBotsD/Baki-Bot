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
    if (!text) return m.reply(`_*[ ⚠️ ] Agrega lo que quieres Descargar en Spotify*_\n\n_Ejemplo:_\n.play Chica Paranormal.`);

    try { 
        let { data } = await axios.get(`${apis.delirius}search/spotify?q=${encodeURIComponent(text)}&limit=10`);

        if (!data.data || data.data.length === 0) {
            throw `_*[ ⚠️ ] No se encontraron resultados para "${text}" en Spotify.*_`;
        }

        const song = data.data[0];
        const img = song.image;
        const url = song.url;

        const info = `⧁ 𝙏𝙄𝙏𝙐𝙇𝙊
» ${song.title}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁ 𝗗𝗨𝗥𝗔𝗖𝗜𝗢𝗡
» ${song.duration}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁  𝘼𝙍𝙏𝙄𝙎𝙏𝘼
» ${song.artist}

_*🎶 Enviando música...*_`.trim();

        await conn.sendFile(m.chat, img, 'imagen.jpg', info, m);
        await conn.sendMessage(m.chat, { text: '🕒 Procesando tu canción...' }, { quoted: m });

        const sendAudio = async (downloadUrl) => {
            await conn.sendMessage(
                m.chat, 
                { audio: { url: downloadUrl }, ptt: true, mimetype: 'audio/mpeg' }, 
                { quoted: m }
            );
            await conn.sendMessage(m.chat, { text: '✅ Enviado correctamente.' }, { quoted: m });
        };

        try {
            const api1 = `${apis.delirius}download/spotifydl?url=${encodeURIComponent(url)}`;
            const result1 = await (await fetch(api1)).json();
            return await sendAudio(result1.data.url);
        } catch (e1) {
            try {
                const api2 = `${apis.delirius}download/spotifydlv3?url=${encodeURIComponent(url)}`;
                const result2 = await (await fetch(api2)).json();
                return await sendAudio(result2.data.url);
            } catch (e2) {
                try {
                    const api3 = `${apis.rioo}api/spotify?url=${encodeURIComponent(url)}`;
                    const result3 = await (await fetch(api3)).json();
                    return await sendAudio(result3.data.response);
                } catch (e3) {
                    try {
                        const api4 = `${apis.ryzen}api/downloader/spotify?url=${encodeURIComponent(url)}`;
                        const result4 = await (await fetch(api4)).json();
                        return await sendAudio(result4.link);
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