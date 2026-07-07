const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Verifica que el bot esté vivo'),
    async execute(interaction) {
        await interaction.reply('🏓 Pong! Bot funcionando correctamente.');
    }
};
