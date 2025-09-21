// Codigo de SoyMaycol y no quites creditos
import yts from "yt-search";
import fetch from "node-fetch";
import { spawn } from "child_process";
import fs from "fs";
import ffmpeg from "ffmpeg-static";

function cleanName(name) {
  return name.replace(/[^\w\s-_.]/gi, "").substring(0, 50);
}

// 🔥 Función para convertir a Opus
async function convertToOpus(inputBuffer) {
  return new Promise((resolve, reject) => {
    const tmpIn = "./tmp_in.mp3";
    const tmpOut = "./tmp_out.opus";
    fs.writeFileSync(tmpIn, inputBuffer);

    const ff = spawn(ffmpeg, [
      "-y",
      "-i", tmpIn,
      "-c:a", "libopus",
      "-b:a", "128k",
      tmpOut,
    ]);

    ff.on("close", () => {
      try {
        const output = fs.readFileSync(tmpOut);
        fs.unlinkSync(tmpIn);
        fs.unlinkSync(tmpOut);
        resolve(output);
      } catch (err) {
        reject(err);
      }
    });

    ff.on("error", (err) => reject(err));
  });
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

    // 🔥 Descargar el audio
    const audioBuffer = await fetch(data.result.url).then((res) => res.buffer());

    // 🔄 Convertir a OGG/Opus
    const opusBuffer = await convertToOpus(audioBuffer);

    // ✅ Mandar como nota de voz (ptt)
    await conn.sendMessage(
      m.chat,
      {
        audio: opusBuffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        fileName: cleanName(title) + ".opus",
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