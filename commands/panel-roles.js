const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-roles')
        .setDescription('Publica el panel de roles configurado en config.js')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const { titulo, descripcion, roles } = config.panelRoles;

        const fila = new ActionRowBuilder();
        for (const rol of roles) {
            fila.addComponents(
                new ButtonBuilder()
                    .setCustomId(`rolpanel_${rol.id}`)
                    .setLabel(rol.etiqueta)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        const embed = new EmbedBuilder()
            .setColor(0x1E3A8A)
            .setTitle(titulo)
            .setDescription(descripcion);

        await interaction.channel.send({ embeds: [embed], components: [fila] });
        await interaction.reply({ content: '✅ Panel de roles publicado.', ephemeral: true });
    }
};
