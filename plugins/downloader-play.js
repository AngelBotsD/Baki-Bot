// Codigo de SoyMaycol y no quites creditos
import yts from "yt-search";

const handler = async (m, { conn, text, command }) => {
if (!text) return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay bebé, necesito algo para trabajar~
├─ Dame el nombre de un video de YouTube
├─ y yo haré magia para ti... ♡
│
├─ ¿No sabes cómo usarme? Escribe:
│   ⇝ .help
├─ Te aseguro que valdré la pena~
╰─✦`);

await m.react("🔥");  

try {  
    const res = await yts(text);  
    if (!res || !res.videos || res.videos.length === 0) {  
        return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Mmm... no encuentro nada así bebé
├─ Intenta con algo más específico
├─ que me haga sudar un poquito~ ♡
╰─✦`);
    }

    const video = res.videos[0];  
    const title = video.title || "Sin título";  
    const authorName = video.author?.name || "Desconocido";  
    const durationTimestamp = video.timestamp || "Desconocida";  
    const url = video.url || "";  

    await downloadVideo(conn, m, url, title, authorName, durationTimestamp);  

} catch (error) {  
    console.error("Error general:", error);  
    await m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay no bebé, algo salió mal...
├─ Pero no te preocupes, sigo siendo tuya~ ♡
├─ Error: ${error.message}
├─ Inténtalo otra vez, prometo portarme bien
╰─✦`);
    await m.react("💔");
}
};

const downloadVideo = async (conn, m, url, title, artist, duration) => {
try {  
    const apiUrl = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp4&apikey=may-0595dca2`;  
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.status || !data.result || !data.result.url) {  
        throw new Error("No pude darte lo que querías amor");  
    }  

    const caption = `> *𝚈𝚃𝙼𝙿4 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${title}\n🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artist}\n🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}\n📹 *𝙲𝚊𝚕𝚒𝚍𝚊𝚍:* 1080p`;

    await conn.sendMessage(m.chat, {  
        video: { url: data.result.url },  
        mimetype: "video/mp4",  
        fileName: title + ".mp4",
        caption
    }, { quoted: m });

    await m.react("🔥");  

} catch (error) {  
    console.error("Error descargando video:", error);  
    await m.reply(`Error descargando video: ${error.message}`);
    await m.react("😈");  
}
};

handler.command = ["play2"];
handler.tags = ["descargas"];

export default handler;