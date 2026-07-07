const { REST, Routes } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`🚔 Bot conectado como ${client.user.tag}`);

        const comandos = client.commands.map(cmd => cmd.data.toJSON());
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        try {
            console.log(`⏳ Registrando ${comandos.length} comando(s) slash...`);

            if (process.env.GUILD_ID) {
                // Registro por servidor: aparece al instante
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
                    { body: comandos }
                );
                console.log('✅ Comandos registrados en el servidor (instantáneo)');
            } else {
                // Registro global: tarda hasta 1 hora en aparecer
                await rest.put(
                    Routes.applicationCommands(client.user.id),
                    { body: comandos }
                );
                console.log('✅ Comandos registrados globalmente (puede tardar ~1 hora)');
            }
        } catch (error) {
            console.error('❌ Error registrando comandos:', error);
        }
    }
};
