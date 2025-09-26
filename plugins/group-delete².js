let handler = async (m, { conn }) => {
  if (!m.quoted) 
    return conn.reply(m.chat, `🧹 Responde al mensaje que deseas eliminar.`, m.key);

  try {
    let delet = m.message.extendedTextMessage?.contextInfo?.participant;
    let bang = m.message.extendedTextMessage?.contextInfo?.stanzaId;

    if (bang && delet) {
      await conn.sendMessage(m.chat, { 
        delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } 
      });
    } else {
      await conn.sendMessage(m.chat, { 
        delete: { remoteJid: m.chat, fromMe: true, id: m.quoted.key.id } 
      });
    }

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '❌ No se pudo eliminar el mensaje.', m.key);
  }
}

handler.customPrefix = /^\.?(del)$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;

export default handler;