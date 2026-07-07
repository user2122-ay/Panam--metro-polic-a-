const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-postulacion')
        .setDescription('Envía el panel de postulación a la Policía Nacional'),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(config.postulaciones.rolAutorizado)) {
            return interaction.reply({ content: '⛔ Solo el Director General puede usar este comando.', ephemeral: true });
        }

        const canal = interaction.guild.channels.cache.get(config.postulaciones.canales.panel);
        if (!canal) {
            return interaction.reply({ content: '⚠️ No encontré el canal de postulación configurado.', ephemeral: true });
        }

        const contenedor = new ContainerBuilder()
            .setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# 📝 Postulación - Policía Nacional de Panamá')
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    'Si deseas formar parte de nuestra institución, presiona el botón para comenzar tu proceso de postulación.\n\nPrimero deberás verificar tu usuario de Roblox.'
                )
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('postulacion_iniciar')
                        .setLabel('Postularme')
                        .setEmoji('📝')
                        .setStyle(ButtonStyle.Success)
                )
            );

        await canal.send({ components: [contenedor], flags: MessageFlags.IsComponentsV2 });
        await interaction.reply({ content: `✅ Panel enviado en <#${canal.id}>.`, ephemeral: true });
    }
};
