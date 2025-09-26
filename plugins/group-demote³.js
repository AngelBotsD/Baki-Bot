let handler = async (m, { conn }) => {
  const user = m.mentionedJid?.[0] 
            || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] 
            || m.quoted?.sender;

  if (!user) {
    return conn.sendMessage(m.chat, { text: '☁️ Por favor, responde o menciona a alguien para degradar.' });
  }

  try {
    const metadata = await conn.groupMetadata(m.chat);
    const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);

    if (!admins.includes(user)) {
      return conn.sendMessage(m.chat, { text: '☁️ Este usuario no es admin.' });
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (e) {
    console.error(e);
  }
};

handler.customPrefix = /^\.?demote/i;
handler.command = new RegExp();

export default handler;