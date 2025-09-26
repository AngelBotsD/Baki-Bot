// Lista de fantasmas detectados por grupo (en memoria)
let ghostList = {};

let handler = async (m, { conn, participants, usedPrefix, command }) => {
    let member = participants.map(u => u.id);
    let botId = conn.user.jid;
    let total = 0;
    let sider = [];

    // Detectar fantasmas
    for (let i = 0; i < member.length; i++) {
        let users = participants.find(u => u.id == member[i]) || {};
        if (
            member[i] !== botId && // Ignorar al bot
            (typeof global.db.data.users[member[i]] === 'undefined' || global.db.data.users[member[i]].chat == 0) &&
            !users.isAdmin && !users.isSuperAdmin &&
            !(global.db.data.users[member[i]]?.whitelist)
        ) {
            total++;
            sider.push(member[i]);
        }
    }

    if (command === 'fantasmas') {
        // Guardar la lista en memoria
        ghostList[m.chat] = sider;

        if (total === 0) {
            return conn.reply(m.chat, '*[❗INFO❗]* No hay fantasmas en este grupo 😎', m);
        }

        // Mostrar lista de fantasmas
        conn.sendMessage(
            m.chat,
            `[ ⚠ REVISIÓN INACTIVA ⚠ ]\n\n𝐆𝐑𝐔𝐏𝐎: 「 ${await conn.getName(m.chat)} 」\n𝐌𝐈𝐄𝐌𝐁𝐑𝐎𝐒: ${member.length}\n\n[ ⇲ LISTA DE FANTASMAS ⇱ ]\n${sider.map(v => '  👻 @' + v.replace(/@.+/, '')).join('\n')}\n\n*Para eliminarlos, usa ${usedPrefix}fankick*`,
            null,
            { mentions: sider }
        );
    } else if (command === 'fankick') {
        // Usar la lista guardada
        let ghosts = ghostList[m.chat] || [];
        if (ghosts.length === 0) return conn.reply(m.chat, 'No hay fantasmas para eliminar 😎', m);

        await conn.groupParticipantsUpdate(m.chat, ghosts, 'remove');
        conn.reply(m.chat, `Se eliminaron ${ghosts.length} miembros fantasmas 👻`, m);

        // Limpiar lista
        delete ghostList[m.chat];
    }
};

handler.help = ['fantasmas', 'fankick'];
handler.tags = ['group'];
handler.command = /^(fantasmas|verfantasmas|sider|fankick)$/i;
handler.admin = true;

export default handler;