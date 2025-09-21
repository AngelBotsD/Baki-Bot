// Codigo de SoyMaycol y no quites creditos
import yts from "yt-search";

const handler = async (m, { conn, text }) => {
if (!text) return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay bebé, dime qué canción quieres ♡
├─ Solo mándame el nombre y yo la busco
│
├─ Ejemplo:
│   ⇝ .play La Santa Fe Klan
╰─✦`);

await m.react("🎧");  

try {  
    const res = await yts(text);  
    if (!res || !res.videos || res.videos.length === 0) {  
        return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ No encontré nada con ese nombre amor
├─ Intenta con algo más claro ♡
╰─✦`);
    }

    const video = res.videos[0];  
    const title = video.title || "Sin título";  
    const authorName = video.author?.name || "Desconocido";  
    const durationTimestamp = video.timestamp || "Desconocida";  
    const url = video.url || "";  

    await downloadAudio(conn, m, url, title, authorName, durationTimestamp);  

} catch (error) {  
    console.error("Error general:", error);  
    await m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay no bebé, algo salió mal...
├─ Error: ${error.message}
├─ Inténtalo otra vez ♡
╰─✦`);
    await m.react("💔");
}
};

const downloadAudio = async (conn, m, url, title, artist, duration) => {
try {  
    const apiUrl = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp3&apikey=may-0595dca2`;  
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.status || !data.result || !data.result.url) {  
        throw new Error("No encontré el audio, amor");  
    }  

    const caption = `> *𝚈𝚃𝙼𝙿3 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${title}\n🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artist}\n🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}\n🎧 *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* 320kbps`;

    await conn.sendMessage(m.chat, {  
        audio: { url: data.result.url },  
        mimetype: "audio/mpeg",  
        fileName: title + ".mp3",  
        caption  
    }, { quoted: m });

    await m.react("🔥");  

} catch (error) {  
    console.error("Error descargando audio:", error);  
    await m.reply(`Error descargando audio: ${error.message}`);
    await m.react("😈");  
}
};

handler.command = ["play"];
handler.tags = ["descargas"];
handler.register = true;

export default handler;