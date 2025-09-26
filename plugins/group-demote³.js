let handler = async (m, { conn }) => {
  if (!m.isGroup || !m.sender) return;

  const body = m.text?.trim();
  if (!body) return;

  // Detectar acción: promote o demote, con o sin punto
  const actionMatch = body.match(/^\.?(promote|demote)/i);
  if (!actionMatch) return;

  const action = actionMatch[1].toLowerCase();

  // Obtener usuario: mencionado con @ o reply
  let user = m.mentionedJid?.[0] 
          || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] 
          || m.quoted?.sender;

  if (!user) return conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } });

  user = user.trim();

  // Obtener admins actuales
  const metadata = await conn.groupMetadata(m.chat);
  const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);

  // Validaciones
  if (action === 'promote' && admins.includes(user)) return;
  if (action === 'demote' && !admins.includes(user)) return;

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], action);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error(e);
  }
};

// Regex genérico para detectar la acción
handler.customPrefix = /^\.?(promote|demote)/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;

export default handler;