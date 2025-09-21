// Codigo de SoyMaycol y no quites creditos
import yts from "yt-search";
import fetch from "node-fetch";

function cleanName(name) {
  return name.replace(/[^\w\s-_.]/gi, "").substring(0, 50);
}

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay bebé, necesito algo para trabajar~
├─ Dame el nombre de un video o URL de YouTube
╰─✦`);

  await m.react("🔥");

  try {
    const res = await yts(text);
    if (!res || !res.videos || res.videos.length === 0) {
      return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Mmm... no encontré nada así bebé
├─ Intenta con algo más específico~
╰─✦`);
    }

    const video = res.videos[0];
    const title = video.title || "Sin título";
    const url = video.url || "";
    const thumbnail = video.thumbnail || "";

    // mensaje inicial
    const initialMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ooh~ encontré algo delicioso:
├─ 「❀」${title}
│
├─ Déjame trabajar mi magia... ♡
╰─✦`;

    await conn.sendMessage(
      m.chat,
      { image: { url: thumbnail }, caption: initialMessage },
      { quoted: m }
    );

    // 🔥 Llamada a la API
    const apiUrl = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(
      url
    )}&type=mp3&apikey=soymaycol<3`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || !data.status || !data.result || !data.result.url) {
      throw new Error("No pude conseguir lo que querías bebé");
    }

    // 🔥 Descargar el audio como buffer
    const audioBuffer = await fetch(data.result.url).then((res) =>
      res.buffer()
    );

    // ✅ Enviar como nota de voz para evitar error
    await conn.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: "audio/mp4", // más compatible que audio/mpeg
        fileName: cleanName(title) + ".mp3",
        ptt: true, // lo manda como nota de voz (seguro funciona)
      },
      { quoted: m }
    );

    await m.react("💋");
  } catch (e) {
    console.error("Error en .play:", e);
    await m.reply(
      `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay no bebé, algo salió mal...
├─ ${e.message}
╰─✦`
    );
    await m.react("💔");
  }
};

handler.command = ["play"];
handler.tags = ["descargas"];
handler.help = ["play"];

export default handler;