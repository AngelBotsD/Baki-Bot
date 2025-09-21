import yts from "yt-search";
import fetch from "node-fetch";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const TMP_DIR = os.tmpdir();

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」\n│   ├─ Ay bebé, dime qué canción quieres ♡\n│   ├─ Solo mándame el nombre y yo la busco\n│   ├─ Ejemplo:\n│   ⇝ .play La Santa Fe Klan\n╰─✦`);

  await m.react("🎧");

  try {
    const res = await yts(text);
    if (!res || !res.videos || res.videos.length === 0) {
      return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」\n│   ├─ No encontré nada con ese nombre amor\n│   ├─ Intenta con algo más claro ♡\n╰─✦`);
    }

    const video = res.videos[0];
    const title = video.title || "Sin título";
    const authorName = video.author?.name || "Desconocido";
    const durationTimestamp = video.timestamp || "Desconocida";
    const url = video.url || "";

    await sendAudioAsPTT(conn, m, url, title, authorName, durationTimestamp);

  } catch (error) {
    console.error("Error general:", error);
    await m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」\n│   ├─ Ay no bebé, algo salió mal...\n│   ├─ Error: ${error.message}\n│   ├─ Inténtalo otra vez ♡\n╰─✦`);
    await m.react("💔");
  }
};

async function sendAudioAsPTT(conn, m, videoUrl, title, artist, duration) {
  const caption = `> *𝚈𝚃𝙼𝙿3 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n\n🎵 *𝚃𝚒𝚝𝚞𝚕𝚘:* ${title}\n🎤 *𝙰𝚛𝚝𝚒𝚜𝚝𝚊:* ${artist}\n🕑 *𝙳𝚞𝚛𝚊𝚌𝚒ó𝚗:* ${duration}\n🎧 *𝙼𝚘𝚍𝚘:* Nota de voz (PTT)`;

  try {
    const apiOpus = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=opus&apikey=soymaycol<3`;
    const resOpus = await fetch(apiOpus, { redirect: "follow" });
    const dataOpus = await resOpus.json().catch(() => null);

    if (dataOpus && dataOpus.status && dataOpus.result && dataOpus.result.url) {
      const buf = await fetch(dataOpus.result.url).then(r => r.buffer());
      await conn.sendMessage(m.chat, {
        audio: buf,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        fileName: cleanName(title) + ".ogg",
        caption
      }, { quoted: m });
      await m.react("🎙️");
      return;
    }
  } catch (e) {
    console.warn("No se obtuvo opus directo de la API o fallo la descarga:", e.message);
  }

  try {
    const apiMp3 = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(videoUrl)}&type=mp3&apikey=soymaycol<3`;
    const resMp3 = await fetch(apiMp3, { redirect: "follow" });
    const dataMp3 = await resMp3.json();

    if (!dataMp3 || !dataMp3.status || !dataMp3.result || !dataMp3.result.url) {
      throw new Error("Api no devolvió mp3");
    }

    const mp3Url = dataMp3.result.url;
    const mp3Buffer = await fetch(mp3Url).then(r => r.buffer());

    const ffmpegPath = "ffmpeg";
    const tmpIn = path.join(TMP_DIR, `in_${Date.now()}.mp3`);
    const tmpOut = path.join(TMP_DIR, `out_${Date.now()}.ogg`);
    fs.writeFileSync(tmpIn, mp3Buffer);

    const canUseFfmpeg = await checkFfmpegExists(ffmpegPath);

    if (canUseFfmpeg) {
      await new Promise((resolve, reject) => {
        const args = ["-y", "-i", tmpIn, "-c:a", "libopus", "-b:a", "64k", "-vbr", "on", tmpOut];
        const cp = spawn(ffmpegPath, args);
        let stderr = "";
        cp.stderr.on("data", d => stderr += d.toString());
        cp.on("close", code => {
          if (code === 0 && fs.existsSync(tmpOut)) resolve();
          else reject(new Error("ffmpeg falló: " + stderr));
        });
      });

      const outBuf = fs.readFileSync(tmpOut);
      await conn.sendMessage(m.chat, {
        audio: outBuf,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        fileName: cleanName(title) + ".ogg",
        caption
      }, { quoted: m });

      safeUnlink(tmpIn);
      safeUnlink(tmpOut);

      await m.react("🎙️");
      return;
    } else {
      await conn.sendMessage(m.chat, {
        audio: mp3Buffer,
        mimetype: "audio/mpeg",
        ptt: true,
        fileName: cleanName(title) + ".mp3",
        caption
      }, { quoted: m });

      safeUnlink(tmpIn);
      await m.react("🎙️");
      return;
    }
  } catch (err) {
    console.error("Error en flujo MP3/FFMPEG:", err);
    await m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」\n│   ├─ Ay bebé, falló intentar enviarte la nota de voz...\n│   ├─ Razón: ${err.message}\n│   ├─ Intenta otra canción o prueba más tarde ♡\n╰─✦`);
    await m.react("😢");
  }
}

function safeUnlink(p) {
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch {}
}

function cleanName(name) {
  return name.replace(/[^\w\s-_.]/gi, "").substring(0, 50).trim();
}

async function checkFfmpegExists(ffmpegPath) {
  return new Promise((res) => {
    const cp = spawn(ffmpegPath, ["-version"]);
    let ok = false;
    cp.on("error", () => res(false));
    cp.stdout.on("data", () => ok = true);
    cp.on("close", () => res(ok));
  });
}

handler.command = ["play"];
handler.tags = ["descargas"];
handler.register = true;

export default handler;