const _0x24c2c5 = _0x5c1f;
(function (_0x45ef65, _0x2f22d5) {
  const _0x2b5ef4 = _0x5c1f, _0x42c509 = _0x45ef65();
  while (!![]) {
    try {
      const _0x2cb798 = parseInt(_0x2b5ef4(0x11a)) / 0x1 + -parseInt(_0x2b5ef4(0x11c)) / 0x2 + parseInt(_0x2b5ef4(0x120)) / 0x3 + parseInt(_0x2b5ef4(0x118)) / 0x4 * (-parseInt(_0x2b5ef4(0x11e)) / 0x5) + -parseInt(_0x2b5ef4(0x117)) / 0x6 + -parseInt(_0x2b5ef4(0x119)) / 0x7 + parseInt(_0x2b5ef4(0x11b)) / 0x8;
      if (_0x2cb798 === _0x2f22d5) break;
      else _0x42c509['push'](_0x42c509['shift']());
    } catch (_0x10d80c) {
      _0x42c509['push'](_0x42c509['shift']());
    }
  }
}(_0x3dd2, 0x6d0b3));

function _0x5c1f(_0x28ad17, _0x43b9de) {
  const _0x3dd230 = _0x3dd2();
  return _0x5c1f = function (_0x5c1f5d, _0x53c89e) {
    _0x5c1f5d = _0x5c1f5d - 0x117;
    let _0x280f46 = _0x3dd230[_0x5c1f5d];
    return _0x280f46;
  }, _0x5c1f(_0x28ad17, _0x43b9de);
}

function _0x3dd2() {
  const _0x14a6a2 = [
    '602932dXzGom', '2897019jpoVPI', '👑\x20*Solo\x20un\x20administrador\x20puede\x20usar\x20este\x20comando*', '28959372iwzzmq', '1158714dhtIuQ', 'mute', '👑\x20*Solo\x20un\x20administrador\x20puede\x20usar\x20este\x20comando*', '😼\x20*Este\x20usuario\x20ya\x20está\x20muteado*', '13238964wBcoFl', 'Unmute', '1973869QkeZsV', '396770AhfohH', '1453336fxoXUv', '😼\x20*Este\x20usuario\x20no\x20estaba\x20muteado*', 'split'
  ];
  _0x3dd2 = function () {
    return _0x14a6a2;
  };
  return _0x3dd2();
}

const handler = async (_0x1ef732, { conn: _0x3f4fa7, command: _0x1c37e6, text: _0x3be58f, isAdmin: _0x363f4d }) => {
  const _0x4a1c09 = _0x5c1f;
  if (_0x1c37e6 === _0x4a1c09(0x11d)) {
    if (!_0x363f4d) throw _0x4a1c09(0x11f);
    let _0x1db38e = _0x1ef732['mentionedJid']?.[0] || (_0x1ef732['quoted'] ? _0x1ef732['quoted']['sender'] : _0x3be58f);
    if (!_0x1db38e) throw '❗️ Menciona o responde al usuario que quieras mutear';
    if (_0x1db38e === _0x3f4fa7['user']['jid']) throw '❌ No puedes mutear al bot';
    if (global['db']['data']['users'][_0x1db38e]?.['mute']) throw _0x4a1c09(0x121);
    global['db']['data']['users'][_0x1db38e]['mute'] = !![];
    _0x3f4fa7['sendMessage'](_0x1ef732['chat'], { 'text': '🔇 Usuario @' + _0x1db38e[_0x4a1c09(0x122)]('@')[0] + ' muteado - sus mensajes serán eliminados', 'mentions': [_0x1db38e] });
  }
  if (_0x1c37e6 === 'unmute') {
    if (!_0x363f4d) throw _0x4a1c09(0x11f);
    let _0x5d0f5c = _0x1ef732['mentionedJid']?.[0] || (_0x1ef732['quoted'] ? _0x1ef732['quoted']['sender'] : _0x3be58f);
    if (!_0x5d0f5c) throw '❗️ Menciona o responde al usuario que quieras desmutear';
    if (!global['db']['data']['users'][_0x5d0f5c]?.['mute']) throw _0x4a1c09(0x117);
    global['db']['data']['users'][_0x5d0f5c]['mute'] = ![];
    _0x3f4fa7['sendMessage'](_0x1ef732['chat'], { 'text': '🔊 Usuario @' + _0x5d0f5c[_0x4a1c09(0x122)]('@')[0] + ' desmuteado - ya puede escribir', 'mentions': [_0x5d0f5c] });
  }
};

handler['before'] = async (_0x28f9c7, { conn: _0x2e0240 }) => {
  let _0x5ecf23 = global['db']['data']['users'][_0x28f9c7['sender']];
  if (_0x5ecf23?.['mute']) {
    await _0x2e0240['sendMessage'](_0x28f9c7['chat'], { 'delete': _0x28f9c7['key'] });
  }
};

handler['command'] = /^(mute|unmute)$/i;
handler['group'] = !![];
handler['admin'] = !![];

export default handler;