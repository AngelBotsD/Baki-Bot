// plugins/addco.js
import fs from "fs"
import path from "path"

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const isGroup = chatId.endsWith("@g.us")
  const senderId = msg.key.participant || msg.key.remoteJid
  const senderNum = senderId.replace(/[^0-9]/g, "")
  const isOwner = global.owner.some(([id]) => id === senderNum)
  const isFromMe = msg.key.fromMe

  // 🛡️ Verificación de permisos
  if (isGroup && !isOwner && !isFromMe) {
    const metadata = await conn.groupMetadata(chatId)
    const participant = metadata.participants.find(p => p.id === senderId)
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin"

    if (!isAdmin) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*"
      }, { quoted: msg })
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el owner o el mismo bot pueden usar este comando en privado.*"
    }, { quoted: msg })
  }

  // 🖼️ Verifica que se responda a un sticker
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quoted?.stickerMessage) {
    return conn.sendMessage(chatId, {
      text: "❌ *Responde a un sticker para asignarle un comando.*"
    }, { quoted: msg })
  }

  const comando = args.join(" ").trim()
  if (!comando) {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Especifica el comando a asignar. Ejemplo:* .addco kick"
    }, { quoted: msg })
  }

  // 🔑 Obtener hash único del sticker (base64 siempre)
  let fileSha = null
  if (quoted.stickerMessage.fileSha256) {
    fileSha = Buffer.from(quoted.stickerMessage.fileSha256).toString("base64")
  } else if (quoted.stickerMessage.fileEncSha256) {
    fileSha = Buffer.from(quoted.stickerMessage.fileEncSha256).toString("base64")
  }

  // fallback: usar stanzaId si no hay hash
  if (!fileSha && msg.message?.extendedTextMessage?.contextInfo?.stanzaId) {
    fileSha = msg.message.extendedTextMessage.contextInfo.stanzaId
  }

  if (!fileSha) {
    return conn.sendMessage(chatId, {
      text: "❌ *No se pudo obtener un ID único del sticker.*"
    }, { quoted: msg })
  }

  // 📂 Guardar en comandos.json
  const jsonPath = path.resolve("./comandos.json")
  const data = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
    : {}

  data[fileSha] = comando
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  })

  return conn.sendMessage(chatId, {
    text: `✅ *Sticker vinculado al comando con éxito:* \`${comando}\``,
    quoted: msg
  })
}

handler.command = ["addco"]
handler.tags = ["tools"]
handler.help = ["addco <comando>"]

export default handler