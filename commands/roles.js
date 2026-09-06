// comandos/roles.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Lista todos los roles del servidor con su ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const roles = interaction.guild.roles.cache
            .filter(r => r.id !== interaction.guild.id) // sacamos @everyone
            .sort((a, b) => b.position - a.position);

        const lineas = roles.map(r => `${r.name} -> ${r.id}`);

        // Discord corta en 2000 caracteres, partimos en bloques
        const bloques = [];
        let actual = '';
        for (const linea of lineas) {
            if ((actual + linea + '\n').length > 1900) {
                bloques.push(actual);
                actual = '';
            }
            actual += linea + '\n';
        }
        if (actual) bloques.push(actual);

        await interaction.editReply({ content: `\`\`\`\n${bloques[0]}\`\`\`` });
        for (let i = 1; i < bloques.length; i++) {
            await interaction.followUp({ content: `\`\`\`\n${bloques[i]}\`\`\``, ephemeral: true });
        }
    },
};
