const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  if (!m.isGroup) return;
  if (!isAdmin && !isOwner) return global.dfail?.('admin', m, conn);

  const total = participants.length;

  // === MAPA DE LADAS → BANDERAS ===
  const flags = {
    '1': '🇺🇸', '7': '🇷🇺', '20': '🇪🇬', '27': '🇿🇦', '30': '🇬🇷', '31': '🇳🇱',
    '32': '🇧🇪', '33': '🇫🇷', '34': '🇪🇸', '36': '🇭🇺', '39': '🇮🇹', '40': '🇷🇴',
    '41': '🇨🇭', '43': '🇦🇹', '44': '🇬🇧', '45': '🇩🇰', '46': '🇸🇪', '47': '🇳🇴',
    '48': '🇵🇱', '49': '🇩🇪', '51': '🇵🇪', '52': '🇲🇽', '53': '🇨🇺', '54': '🇦🇷',
    '55': '🇧🇷', '56': '🇨🇱', '57': '🇨🇴', '58': '🇻🇪', '60': '🇲🇾', '61': '🇦🇺',
    '62': '🇮🇩', '63': '🇵🇭', '64': '🇳🇿', '65': '🇸🇬', '66': '🇹🇭', '81': '🇯🇵',
    '82': '🇰🇷', '84': '🇻🇳', '86': '🇨🇳', '90': '🇹🇷', '91': '🇮🇳', '92': '🇵🇰',
    '93': '🇦🇫', '94': '🇱🇰', '95': '🇲🇲', '98': '🇮🇷', '212': '🇲🇦', '213': '🇩🇿',
    '216': '🇹🇳', '218': '🇱🇾', '233': '🇬🇭', '234': '🇳🇬', '255': '🇹🇿',
    '256': '🇺🇬', '260': '🇿🇲', '263': '🇿🇼', '351': '🇵🇹', '352': '🇱🇺',
    '353': '🇮🇪', '354': '🇮🇸', '355': '🇦🇱', '356': '🇲🇹', '358': '🇫🇮',
    '359': '🇧🇬', '370': '🇱🇹', '371': '🇱🇻', '372': '🇪🇪', '373': '🇲🇩',
    '374': '🇦🇲', '380': '🇺🇦', '381': '🇷🇸', '385': '🇭🇷', '420': '🇨🇿',
    '421': '🇸🇰', '502': '🇬🇹', '503': '🇸🇻', '504': '🇭🇳', '505': '🇳🇮',
    '506': '🇨🇷', '507': '🇵🇦', '509': '🇭🇹', '591': '🇧🇴', '593': '🇪🇨',
    '595': '🇵🇾', '598': '🇺🇾'
    // puedes seguir rellenando con la lista ITU completa si quieres
  };

  // 🔧 Función para normalizar un número DS6
  function normalizar(num) {
    if (num.startsWith('521')) return '52' + num.slice(3); // México
    if (num.startsWith('549')) return '54' + num.slice(3); // Argentina
    if (num.startsWith('573')) return '57' + num.slice(3); // Colombia
    if (num.startsWith('569')) return '56' + num.slice(3); // Chile
    return num;
  }

  let texto = `*!  MENCION GENERAL  !*\n`;
  texto += `   *PARA ${total} MIEMBROS* 🔔\n\n`;

  for (const user of participants) {
    let numero = user.id.split('@')[0];
    numero = normalizar(numero);

    // quitar "+" si existe
    const lada = numero.startsWith('+') ? numero.slice(1) : numero;

    // buscar prefijo más largo posible
    const ladaMatch = Object.keys(flags)
      .sort((a, b) => b.length - a.length)
      .find(code => lada.startsWith(code));

    const flag = ladaMatch ? flags[ladaMatch] : '🚩';

    texto += `┊» ${flag} @${numero}\n`;
  }

  await conn.sendMessage(m.chat, { react: { text: '🔊', key: m.key } });

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: participants.map(p => p.id)
  }, { quoted: m });
};

handler.customPrefix = /^\.?(todos|invocar|invocacion|invocación)$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;

export default handler;