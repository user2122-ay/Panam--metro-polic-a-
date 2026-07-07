require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { conectarMongo } = require('./config/database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();

// Cargar comandos dinámicamente desde /commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

// Cargar eventos dinámicamente desde /events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));

    // Envolvemos la ejecución para que un error en un evento no tumbe todo el bot
    const ejecucionSegura = async (...args) => {
        try {
            await event.execute(...args, client);
        } catch (error) {
            console.error(`❌ Error en el evento ${event.name}:`, error);
        }
    };

    if (event.once) {
        client.once(event.name, ejecucionSegura);
    } else {
        client.on(event.name, ejecucionSegura);
    }
}

// Servidor HTTP mínimo: sin esto, Fly.io cree que la app no responde y la mata
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot activo');
}).listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor HTTP escuchando en el puerto ${PORT}`);
});

async function iniciar() {
    await conectarMongo();
    await client.login(process.env.DISCORD_TOKEN);
}

iniciar();
