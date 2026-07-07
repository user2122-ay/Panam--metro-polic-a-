const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const canal = member.guild.channels.cache.get(config.canales.bienvenida);
        if (!canal) return;

        const lista = config.mensajesMotivadores;
        const mensaje = lista[Math.floor(Math.random() * lista.length)];

        const embed = new EmbedBuilder()
            .setColor(0x1E3A8A)
            .setTitle('🚔 ¡Bienvenido a la Policía Nacional de Panamá!')
            .setDescription(
                `¡Hola ${member}! Es un honor tenerte con nosotros.\n\n` +
                `💬 *"${mensaje}"*\n\n` +
                `Para comenzar tu camino en la institución:\n` +
                `📋 Funciones y normativa: <#${config.canales.funciones}>\n` +
                `🪪 Subdivisiones disponibles: <#${config.canales.subdivision}>\n` +
                `📝 Postulación a una subdivisión: <#${config.canales.postulacion}>`
            )
            .setImage(config.imagenBienvenida)
            .setFooter({ text: 'Policía Nacional de Panamá', iconURL: member.guild.iconURL() })
            .setTimestamp();

        canal.send({ content: `${member}`, embeds: [embed] }).catch(console.error);
    }
};
