const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags,
} = require('discord.js');
const config = require('../config.js');
const Placa = require('../models/Placa.js');
const ContadorPlaca = require('../models/ContadorPlaca.js');
const Postulacion = require('../models/Postulacion.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('placa')
        .setDescription('Asigna una placa oficial a un miembro')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a quien asignar la placa').setRequired(true))
        .addStringOption(opt => opt.setName('roblox').setDescription('Usuario de Roblox (solo si no tiene postulación registrada)').setRequired(false)),

    async execute(interaction) {
        const tienePermiso = interaction.member.roles.cache.some(rol =>
            config.placas.rolesAutorizados.includes(rol.id)
        );
        if (!tienePermiso) {
            return interaction.reply({ content: '⛔ Solo un Oficial puede asignar placas.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const usuarioObjetivo = interaction.options.getUser('usuario');
        const robloxManual = interaction.options.getString('roblox');
        const miembroObjetivo = await interaction.guild.members.fetch(usuarioObjetivo.id).catch(() => null);

        if (!miembroObjetivo) {
            return interaction.editReply({ content: '⚠️ No pude encontrar a ese usuario en el servidor.' });
        }

        // Determinar la letra según la subdivisión del usuario
        let letra = config.placas.letraDefault;
        for (const [rolId, letraSubdivision] of Object.entries(config.placas.subdivisiones)) {
            if (miembroObjetivo.roles.cache.has(rolId)) {
                letra = letraSubdivision;
                break;
            }
        }

        // Obtener el usuario de Roblox: primero de la postulación aceptada, si no, del parámetro manual
        let robloxUsuario = robloxManual;
        if (!robloxUsuario) {
            const postulacion = await Postulacion.findOne({ usuarioId: usuarioObjetivo.id, estado: 'aceptado' }).sort({ fechaRevision: -1 });
            robloxUsuario = postulacion?.robloxUsuario;
        }

        if (!robloxUsuario) {
            return interaction.editReply({ content: '⚠️ No encontré un usuario de Roblox registrado para esta persona. Vuelve a ejecutar el comando incluyendo la opción `roblox` con su nombre.' });
        }

        // Asignar número consecutivo para esa letra
        const contador = await ContadorPlaca.findOneAndUpdate(
            { letra },
            { $inc: { ultimoNumero: 1 } },
            { upsert: true, new: true }
        );
        const numeroTexto = String(contador.ultimoNumero).padStart(3, '0');
        const placaTexto = `1${letra}-${numeroTexto}`;
        const apodoNuevo = `${placaTexto} | ${robloxUsuario}`;

        try {
            await miembroObjetivo.setNickname(apodoNuevo.slice(0, 32));
        } catch (error) {
            console.error('❌ Error cambiando apodo:', error);
            return interaction.editReply({ content: `⚠️ La placa se generó (${placaTexto}) pero no pude cambiar el apodo. Revisa que mi rol esté por encima del suyo en la jerarquía.` });
        }

        await Placa.findOneAndUpdate(
            { usuarioId: usuarioObjetivo.id },
            {
                usuarioId: usuarioObjetivo.id,
                usuarioTag: usuarioObjetivo.tag,
                robloxUsuario,
                placa: placaTexto,
                letra,
                numero: contador.ultimoNumero,
                asignadoPor: interaction.user.tag,
                fecha: new Date(),
            },
            { upsert: true }
        );

        const contenedor = new ContainerBuilder()
            .setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 🪪 Placa asignada'))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Usuario:** <@${usuarioObjetivo.id}>\n**Roblox:** ${robloxUsuario}\n**Placa:** ${placaTexto}\n**Asignado por:** ${interaction.user.tag}`
            ));

        await interaction.editReply({ components: [contenedor], flags: MessageFlags.IsComponentsV2 });
    }
};
