const { EmbedBuilder } = require('discord.js');

const CANAL_BIENVENIDA = '1523547183608107089';
const CANAL_SUBDIVISION = '1523547450726551693';
const CANAL_FUNCIONES = '1523547701109592064';
const CANAL_POSTULACION = '1523548265340076184';

const MENSAJES_MOTIVADORES = [
    'La disciplina y el honor son la base de nuestra institución. ¡Bienvenido a las filas!',
    'Cada nuevo miembro fortalece nuestra misión de servir y proteger. ¡Éxitos en tu camino!',
    'El uniforme se lleva con orgullo, pero el compromiso se lleva en el corazón.',
    'Servir a la comunidad es el mayor honor. Hoy comienza tu historia con nosotros.',
];

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const canal = member.guild.channels.cache.get(CANAL_BIENVENIDA);
        if (!canal) return;

        const mensaje = MENSAJES_MOTIVADORES[Math.floor(Math.random() * MENSAJES_MOTIVADORES.length)];

        const embed = new EmbedBuilder()
            .setColor(0x1E3A8A)
            .setTitle('🚔 ¡Bienvenido a la Policía Nacional de Panamá!')
            .setDescription(
                `¡Hola ${member}! Es un honor tenerte con nosotros.\n\n` +
                `💬 *"${mensaje}"*\n\n` +
                `Para comenzar tu camino en la institución:\n` +
                `📋 Funciones y normativa: <#${CANAL_FUNCIONES}>\n` +
                `🪪 Subdivisiones disponibles: <#${CANAL_SUBDIVISION}>\n` +
                `📝 Postulación a una subdivisión: <#${CANAL_POSTULACION}>`
            )
            // 👇 Aquí va tu imagen, pega la URL cuando la tengas (ej: link de Discord CDN o Imgur)
            .setImage('PON_AQUI_LA_URL_DE_TU_IMAGEN')
            .setFooter({ text: 'Policía Nacional de Panamá', iconURL: member.guild.iconURL() })
            .setTimestamp();

        canal.send({ content: `${member}`, embeds: [embed] }).catch(console.error);
    }
};
