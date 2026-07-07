const postulaciones = require('../handlers/postulaciones.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Hubo un error ejecutando este comando.', ephemeral: true });
            }
            return;
        }

        if (interaction.isButton() && interaction.customId.startsWith('postulacion_')) {
            try {
                await postulaciones.manejarBoton(interaction);
            } catch (error) {
                console.error('❌ Error en botón de postulación:', error);
            }
            return;
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('postulacion_')) {
            try {
                await postulaciones.manejarModal(interaction);
            } catch (error) {
                console.error('❌ Error en modal de postulación:', error);
            }
        }
    }
};
