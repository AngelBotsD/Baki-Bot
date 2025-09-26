let handler = async (m, { conn, text, participants, command }) => {
    let member = participants.map(u => u.id)
    let sum = !text ? member.length : text
    let total = 0
    let sider = []

    const botId = conn.user.jid.split('@')[0]
    const now = Date.now()
    const maxInactivity = 72 * 60 * 60 * 1000 // 72 horas

    for (let i = 0; i < sum; i++) {
        let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
        let userData = global.db.data.users[member[i]]
        let memberId = member[i].split('@')[0]

        // Ignorar al bot
        if (memberId === botId) continue

        // Ignorar admins
        if (users?.isAdmin || users?.isSuperAdmin) continue

        // Si nunca habló
        if (!userData || !userData.lastSeen) {
            total++
            sider.push(member[i])
            continue
        }

        // Si habló hace más de 72h
        if (now - userData.lastSeen >= maxInactivity) {
            total++
            sider.push(member[i])
        }
    }

    if (total === 0) return conn.reply(m.chat, `*[❗INFO❗]* Nadie lleva más de 72 horas inactivo en este grupo.`, m)

    if (command === 'fankick') {
        await conn.groupParticipantsUpdate(m.chat, sider, 'remove')
        let eliminados = sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')
        return conn.reply(m.chat, `*Fantasmas eliminados (inactivos +72h):*\n${eliminados}`, null, { mentions: sider })
    }

    let mensaje = `[ ⚠ 𝙍𝙀𝙑𝙄𝙎𝙄𝙊𝙉 𝙄𝙉𝘼𝘾𝙏𝙄𝙑𝘼 ⚠ ]\n\n𝐆𝐑𝐔𝐏𝐎: ${await conn.getName(m.chat)}\n𝐌𝐈𝐄𝐌𝐁𝐑𝐎𝐒: ${sum}\n\n[ ⇲ 𝙇𝙄𝙎𝙏𝘼 𝘿𝙀 𝙁𝘼𝙉𝙏𝘼𝙎𝙈𝘼𝙎 (72h+) ⇱ ]\n${sider.map(v => '  👻 @' + v.replace(/@.+/, '')).join('\n')}`

    mensaje += `\n\n*_ELIMINANDOS COMO NO SE ACTIVEN_*\n⏰ Criterio: inactividad mayor a *72 horas*\n\n🧹 *Si deseas eliminar a todos los fantasmas, ejecuta:*\n.fankick`

    conn.reply(m.chat, mensaje, null, { mentions: sider })
}

handler.help = ['fantasmas', 'fankick']
handler.tags = ['group']
handler.command = /^(verfantasmas|fantasmas|sider|fankick)$/i
handler.admin = true
export default handler