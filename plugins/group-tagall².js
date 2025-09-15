import { allCountries } from "country-telephone-data";

const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  if (!m.isGroup) return;
  if (!isAdmin && !isOwner) return global.dfail?.('admin', m, conn);

  const total = participants.length;

  // Crear mapa de prefijos → banderas
  const flags = {};
  for (const country of allCountries) {
    const prefix = country.dialCode;  // ej: "52"
    const cc = country.iso2.toUpperCase(); // ej: "MX"
    const flag = cc.replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
    flags[prefix] = flag;
  }

  let texto = `*!  MENCION GENERAL  !*\n`;
  texto += `   *PARA ${total} MIEMBROS* 🔔\n\n`;

  for (const user of participants) {
    const numero = user.id.split('@')[0];
    const lada = numero.startsWith('+') ? numero.slice(1) : numero;

    // Buscar la coincidencia más larga de prefijo
    let flag = '🚩';
    let bestMatch = '';
    for (const prefix of Object.keys(flags)) {
      if (lada.startsWith(prefix) && prefix.length > bestMatch.length) {
        bestMatch = prefix;
        flag = flags[prefix];
      }
    }

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