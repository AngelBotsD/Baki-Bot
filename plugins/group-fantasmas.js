// plugins/fantasmas.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Solo necesario si usas __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIGITS = (s = "") => String(s).replace(/\D/g, "");

/** Normaliza: si un participante viene como @lid y tiene .jid (real), usa ese real */
function lidParser(participants = []) {
  try {
    return participants.map(v => ({
      id: (typeof v?.id === "string" && v.id.endsWith("@lid") && v.jid)
        ? v.jid
        : v.id,
      admin: v?.admin ?? null,
      raw: v
    }));
  } catch {
    return participants || [];
  }
}

/** ¿Es admin por NÚMERO? (sirve en LID y no-LID) */
async function isAdminByNumber(conn, chatId, number) {
  try {
    const meta = await conn.groupMetadata(chatId);
    const raw  = Array.isArray(meta?.participants) ? meta.participants : [];
    const norm = lidParser(raw);

    for (let i = 0; i < raw.length; i++) {
      const r = raw[i], n = norm[i];
      const isAdm = (r?.admin === "admin" || r?.admin === "superadmin" ||
                     n?.admin === "admin" || n?.admin === "superadmin");
      if (!isAdm) continue;
      const ids = [r?.id, r?.jid, n?.id];
      if (ids.some(x => DIGITS(x || "") === number)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Obtiene el conteo para un participante, priorizando el JID real guardado en chatCount */
function getCountForParticipant(pRaw, pNormId, chatCount) {
  const candidates = new Set();

  if (typeof pNormId === "string" && pNormId.endsWith("@s.whatsapp.net")) {
    candidates.add(pNormId);
  }

  if (typeof pRaw?.id === "string") candidates.add(pRaw.id);

  const d = DIGITS(pNormId || pRaw?.id || "");
  if (d) candidates.add(`${d}@s.whatsapp.net`);

  for (const key of candidates) {
    const val = parseInt(chatCount[key]);
    if (!Number.isNaN(val)) return val;
  }
  return 0;
}

const handler = async (msg, { conn, args }) => {
  const chatId    = msg.key.remoteJid;
  const isGroup   = chatId.endsWith("@g.us");
  const senderId  = msg.key.participant || msg.key.remoteJid;
  const senderNum = DIGITS(senderId);

  if (!isGroup) {
    await conn.sendMessage(chatId, { text: "❌ *Este comando solo se puede usar en grupos.*" }, { quoted: msg });
    return;
  }

  const isAdmin = await isAdminByNumber(conn, chatId, senderNum);

  const ownerPath = path.resolve("owner.json");
  const owners = fs.existsSync(ownerPath)
    ? JSON.parse(fs.readFileSync(ownerPath, "utf-8"))
    : (global.owner || []);
  const isOwner = Array.isArray(owners) && owners.some(([id]) => id === senderNum);

  if (!isAdmin && !isOwner) {
    await conn.sendMessage(chatId, { text: "⛔ *Solo administradores o dueños del bot pueden usar este comando.*" }, { quoted: msg });
    return;
  }

  const limite = parseInt(args[0]);
  if (Number.isNaN(limite)) {
    await conn.sendMessage(chatId, {
      text: "❓ *Debes escribir un número de mensajes para detectar fantasmas.*\n\nEjemplo: `.fantasmas 10`"
    }, { quoted: msg });
    return;
  }

  const filePath = path.resolve("setwelcome.json");
  const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf-8")) : {};
  const chatData = data[chatId]?.chatCount || {};

  const metadata = await conn.groupMetadata(chatId);
  const participantsRaw = Array.isArray(metadata?.participants) ? metadata.participants : [];
  const participantsNorm = lidParser(participantsRaw);

  const fantasmasObjs = [];
  for (let i = 0; i < participantsRaw.length; i++) {
    const pRaw = participantsRaw[i];
    const pNormId = participantsNorm[i]?.id;
    const count = getCountForParticipant(pRaw, pNormId, chatData);

    if (count < limite) {
      const visibleMentionJid = pRaw.id;
      fantasmasObjs.push({
        visibleMentionJid,
        placeholder: `@${(visibleMentionJid || "").split("@")[0]}`,
        count
      });
    }
  }

  const advertencia =
`⚠️ *Advertencia Importante*
Este conteo solo se basa en los mensajes detectados desde que fue agregada al grupo.
No refleja actividad real de todo el historial del grupo. Podría mostrar como fantasmas a miembros valiosos que simplemente no han hablado aún.

Usa este comando con inteligencia 💡. Si planeas expulsar con *.fankick*, asegúrate de entender este límite.

`;

  if (fantasmasObjs.length === 0) {
    await conn.sendMessage(chatId, {
      text: `✅ *Todos los miembros han enviado más de ${limite} mensajes.*`
    }, { quoted: msg });
    return;
  }

  const listado =
    fantasmasObjs
      .map((u, i) => `│ ${i + 1}. ${u.placeholder}`)
      .join("\n");

  const texto =
`${advertencia}👻 *Total de fantasmas detectados:* ${fantasmasObjs.length} usuarios
📝 *Han enviado menos de ${limite} mensajes desde que el bot está en el grupo:*

╭───────────────◆
${listado}
╰───────────────◆

🗑️ Usa *.fankick ${limite}* para eliminar automáticamente a estos inactivos.`;

  await conn.sendMessage(
    chatId,
    {
      text: texto,
      mentions: fantasmasObjs.map(f => f.visibleMentionJid)
    },
    { quoted: msg }
  );
};

handler.command = ["fantasmas"];
export default handler;