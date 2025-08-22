const groupEmojis = {}; // Emoji por grupo

const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  if (!m.isGroup) return;
  if (!isAdmin && !isOwner) return global.dfail?.('admin', m, conn);

  const chatId = m.chat;
  const text = (m.text || m.msg?.caption || '').trim();

  // Detectar comando y argumento
  let command = '';
  let argsText = '';

  if (/^\.?setemoji/i.test(text)) {
    command = 'setemoji';
    argsText = text.replace(/^\.?setemoji/i, '').trim();
  } else if (/^\.?todos/i.test(text)) {
    command = 'todos';
  } else {
    return; // No es ninguno de nuestros comandos
  }

  if (command === 'setemoji') {
    if (!argsText) return conn.sendMessage(chatId, { text: '❌ Envía un emoji después del comando' });
    groupEmojis[chatId] = argsText.split(' ')[0]; // solo el primer token como emoji
    return conn.sendMessage(chatId, { text: `✅ Emoji cambiado a: ${groupEmojis[chatId]}` });
  }

  if (command === 'todos') {
    const emoji = groupEmojis[chatId] || '🗣️';
    const total = participants.length;

    let mensaje = `*!  MENCION GENERAL  !*\n`;
    mensaje += `*PARA ${total} MIEMBROS* ${emoji}\n\n`;

    for (const user of participants) {
      const numero = user.id.split('@')[0];
      mensaje += `${emoji} @${numero}\n`;
    }

    return conn.sendMessage(chatId, {
      text: mensaje,
      mentions: participants.map(p => p.id)
    });
  }
};

handler.customPrefix = /^(todos|\.todos|\.setemoji)/i;
handler.group = true;
handler.admin = true;

export default handler;