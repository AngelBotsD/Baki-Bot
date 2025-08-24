let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`⚡ Ingresa el enlace del Grupo.`);

    // Regex que captura el código de cualquier enlace de WhatsApp, ignorando parámetros extras
    let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    let match = text.match(linkRegex);
    if (!match) return m.reply('Enlace inválido. Asegúrate de copiarlo completo desde WhatsApp.');

    let code = match[1];

    try {
        let res = await conn.groupAcceptInvite(code);
        m.reply(`🐾 Me uní correctamente al Grupo *${res}*`);
    } catch (e) {
        console.error('Error al unirse:', e); // Para depuración
        let msg = '❌ No pude unirme al grupo.';

        // Mensajes de error claros según tipo de fallo
        if (e?.status === 401 || /invitation code invalid/i.test(e.message)) {
            msg += ' El enlace es inválido o expirado.';
        } else if (/too many participants/i.test(e.message)) {
            msg += ' El grupo está lleno.';
        } else if (/not authorized/i.test(e.message)) {
            msg += ' Mi número no puede unirse a este grupo.';
        } else if (/already joined/i.test(e.message)) {
            msg += ' Ya estoy en este grupo.';
        } else {
            msg += ` Error: ${e.message || e}`;
        }

        m.reply(msg);
    }
};

handler.help = ['join <link>'];
handler.tags = ['owner'];
handler.command = ['join', 'entrar'];
handler.owner = true;

export default handler;