const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Asignar autoroles
        if (config.autoroles && config.autoroles.length > 0) {
            try {
                await member.roles.add(config.autoroles);
                console.log(`✅ Autoroles asignados a ${member.user.tag}`);
            } catch (error) {
                console.error(`❌ Error asignando autoroles a ${member.user.tag}:`, error);
            }
        }

        // Mensaje de bienvenida
        const canal = member.guild.channels.cache.get(config.canales.bienvenida);
        if (!canal) return;

        const lista = config.mensajesMotivadores;
        const mensaje = lista[Math.floor(Math.random() * lista.length)];

        const contenedor = new ContainerBuilder()
            .setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# 🚔 Bienvenido a la Policía Nacional de Panamá')
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`¡Hola ${member}! Es un honor tenerte con nosotros.`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`💬 *"${mensaje}"*`)
            );

        if (config.imagenBienvenida && config.imagenBienvenida.startsWith('http')) {
            contenedor.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(config.imagenBienvenida)
                )
            );
        }

        contenedor
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Para comenzar tu camino en la institución, revisa:')
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('📋 Funciones').setStyle(ButtonStyle.Link).setURL(config.enlaces.funciones),
                    new ButtonBuilder().setLabel('🪪 Subdivisiones').setStyle(ButtonStyle.Link).setURL(config.enlaces.subdivision),
                    new ButtonBuilder().setLabel('📝 Postulación').setStyle(ButtonStyle.Link).setURL(config.enlaces.postulacion)
                )
            );

        canal.send({
            components: [contenedor],
            flags: MessageFlags.IsComponentsV2,
        }).catch(console.error);
    }
};
