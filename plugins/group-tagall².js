// 🌍 Diccionario E.164 completo (prefijo -> ISO2)
const countryPrefixes = {
  "1": "US", "1242": "BS", "1246": "BB", "1264": "AI", "1268": "AG", "1284": "VG",
  "1340": "VI", "1345": "KY", "1441": "BM", "1473": "GD", "1649": "TC", "1664": "MS",
  "1670": "MP", "1671": "GU", "1684": "AS", "1758": "LC", "1767": "DM", "1784": "VC",
  "1787": "PR", "1809": "DO", "1829": "DO", "1849": "DO", "1868": "TT", "1869": "KN",
  "1876": "JM", "1939": "PR",
  "20": "EG", "211": "SS", "212": "MA", "213": "DZ", "216": "TN", "218": "LY",
  "220": "GM", "221": "SN", "222": "MR", "223": "ML", "224": "GN", "225": "CI",
  "226": "BF", "227": "NE", "228": "TG", "229": "BJ", "230": "MU", "231": "LR",
  "232": "SL", "233": "GH", "234": "NG", "235": "TD", "236": "CF", "237": "CM",
  "238": "CV", "239": "ST", "240": "GQ", "241": "GA", "242": "CG", "243": "CD",
  "244": "AO", "245": "GW", "246": "IO", "248": "SC", "249": "SD", "250": "RW",
  "251": "ET", "252": "SO", "253": "DJ", "254": "KE", "255": "TZ", "256": "UG",
  "257": "BI", "258": "MZ", "260": "ZM", "261": "MG", "262": "RE", "263": "ZW",
  "264": "NA", "265": "MW", "266": "LS", "267": "BW", "268": "SZ", "269": "KM",
  "27": "ZA", "290": "SH", "297": "AW", "298": "FO", "299": "GL",
  "30": "GR", "31": "NL", "32": "BE", "33": "FR", "34": "ES", "36": "HU", "39": "IT",
  "40": "RO", "41": "CH", "43": "AT", "44": "GB", "45": "DK", "46": "SE", "47": "NO",
  "48": "PL", "49": "DE",
  "51": "PE", "52": "MX", "53": "CU", "54": "AR", "55": "BR", "56": "CL", "57": "CO",
  "58": "VE", "60": "MY", "61": "AU", "62": "ID", "63": "PH", "64": "NZ", "65": "SG",
  "66": "TH", "81": "JP", "82": "KR", "84": "VN", "86": "CN", "90": "TR", "91": "IN",
  "92": "PK", "93": "AF", "94": "LK", "95": "MM", "98": "IR",
  "211": "SS", "212": "MA", "213": "DZ", "218": "LY",
  "351": "PT", "352": "LU", "353": "IE", "354": "IS", "355": "AL", "356": "MT",
  "357": "CY", "358": "FI", "359": "BG",
  "370": "LT", "371": "LV", "372": "EE", "373": "MD", "374": "AM", "375": "BY",
  "376": "AD", "377": "MC", "378": "SM", "380": "UA", "381": "RS", "382": "ME",
  "383": "XK", "385": "HR", "386": "SI", "387": "BA", "389": "MK",
  "420": "CZ", "421": "SK", "423": "LI",
  "500": "FK", "501": "BZ", "502": "GT", "503": "SV", "504": "HN", "505": "NI",
  "506": "CR", "507": "PA", "509": "HT",
  "591": "BO", "592": "GY", "593": "EC", "594": "GF", "595": "PY", "597": "SR",
  "598": "UY",
  "670": "TL", "672": "NF", "673": "BN", "674": "NR", "675": "PG", "676": "TO",
  "677": "SB", "678": "VU", "679": "FJ", "680": "PW", "681": "WF", "682": "CK",
  "683": "NU", "685": "WS", "686": "KI", "687": "NC", "688": "TV", "689": "PF",
  "690": "TK", "691": "FM", "692": "MH",
  "850": "KP", "852": "HK", "853": "MO", "855": "KH", "856": "LA", "880": "BD",
  "886": "TW",
  "960": "MV", "961": "LB", "962": "JO", "963": "SY", "964": "IQ", "965": "KW",
  "966": "SA", "967": "YE", "968": "OM", "970": "PS", "971": "AE", "972": "IL",
  "973": "BH", "974": "QA", "975": "BT", "976": "MN", "977": "NP", "992": "TJ",
  "993": "TM", "994": "AZ", "995": "GE", "996": "KG", "998": "UZ"
};

// ISO2 → bandera
function getFlagFromISO(iso2) {
  return iso2.replace(/./g, c =>
    String.fromCodePoint(127397 + c.charCodeAt())
  );
}

const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  if (!m.isGroup) return;
  if (!isAdmin && !isOwner) return global.dfail?.("admin", m, conn);

  const total = participants.length;

  let texto = `*!  MENCION GENERAL  !*\n`;
  texto += `   *PARA ${total} MIEMBROS* 🔔\n\n`;

  for (const user of participants) {
    const numero = user.id.split("@")[0];
    const lada = numero.startsWith("+") ? numero.slice(1) : numero;

    // Buscar prefijo más largo válido
    let flag = "🚩";
    let bestMatch = "";
    for (const prefix of Object.keys(countryPrefixes)) {
      if (lada.startsWith(prefix) && prefix.length > bestMatch.length) {
        bestMatch = prefix;
        flag = getFlagFromISO(countryPrefixes[prefix]);
      }
    }

    texto += `┊» ${flag} @${numero}\n`;
  }

  await conn.sendMessage(m.chat, { react: { text: "🔊", key: m.key } });

  await conn.sendMessage(
    m.chat,
    {
      text: texto,
      mentions: participants.map(p => p.id),
    },
    { quoted: m }
  );
};

handler.customPrefix = /^\.?(todos|invocar|invocacion|invocación)$/i;
handler.command = new RegExp();
handler.group = true;
handler.admin = true;

export default handler;