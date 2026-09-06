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
        .addUserOption(opcion =>
            opcion.setName('usuario')
                .setDescription('Miembro al que se le asignará la placa')
                .setRequired(true)
        )
        .addStringOption(opcion =>
            opcion.setName('roblox')
                .setDescription('Usuario de Roblox (opcional si ya tiene postulación aceptada)')
                .setRequired(false)
        ),

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
        const Objetivo = await interaction.guild.members.fetch(usuarioObjetivo.id).catch(() => null);

        if (!Objetivo) {
            return interaction.editReply({ content: '⚠️ No pude encontrar a ese miembro en el servidor.' });
        }

        // Determinar la letra según la subdivisión del usuario
        let letra = config.placas.letraDefault;
        for (const [rolId, letraSubdivision] of Object.entries(config.placas.subdivisiones)) {
            if (Objetivo.roles.cache.has(rolId)) {
                letra = letraSubdivision;
                break;
            }
        }

        // Obtener el usuario de Roblox: manual, o de la postulación aceptada
        let RobloxUsuario = robloxManual;
        if (!RobloxUsuario) {
            const postulacion = await Postulacion.findOne({ usuarioId: Objetivo.id, estado: 'aceptado' });
            RobloxUsuario = postulacion?.robloxUsuario;
        }

        if (!RobloxUsuario) {
            return interaction.editReply({ content: '⚠️ No encontré un usuario de Roblox. Pásalo manual con la opción "roblox" o revisa que tenga una postulación aceptada.' });
        }

        // Placa reservada: se salta el contador si el rol está en config.placas.reservadas
        const rolReservado = Object.keys(config.placas.reservadas || {}).find(rolId =>
            Objetivo.roles.cache.has(rolId)
        );

        let placaTexto;
        let letraFinal = letra;
        let numeroFinal;

        if (rolReservado) {
            placaTexto = config.placas.reservadas[rolReservado];
            const [letraParte, numeroParte] = placaTexto.split('-');
            letraFinal = letraParte.replace(/[0-9]/g, '');
            numeroFinal = parseInt(numeroParte, 10);
        } else {
            const contador = await ContadorPlaca.findOneAndUpdate(
                { letra },
                { $inc: { ultimoNumero: 1 } },
                { upsert: true, new: true }
            );
            const numeroTexto = String(contador.ultimoNumero).padStart(3, '0');
            placaTexto = `1${letra}-${numeroTexto}`;
            numeroFinal = contador.ultimoNumero;
        }

        const apodoNuevo = `${placaTexto}|${RobloxUsuario}`;

        try {
            await Objetivo.setNickname(apodoNuevo.slice(0, 32));
        } catch (error) {
            console.error('❌ Error cambiando apodo:', error);
            return interaction.editReply({ content: `⚠️ La placa se generó (**${placaTexto}**) pero no pude cambiar el apodo. Puede que ese usuario tenga un rol más alto que el del bot.` });
        }

        await Placa.findOneAndUpdate(
            { usuarioId: usuarioObjetivo.id },
            {
                usuarioId: usuarioObjetivo.id,
                usuarioTag: usuarioObjetivo.tag,
                robloxUsuario: RobloxUsuario,
                placa: placaTexto,
                letra: letraFinal,
                numero: numeroFinal,
                asignadoPor: interaction.user.tag,
                fecha: new Date(),
            },
            { upsert: true }
        );

        const contenedor = new ContainerBuilder()
            .setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 🪪 Placa asignada'))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Usuario:** <@${usuarioObjetivo.id}>\n**Roblox:** ${RobloxUsuario}\n**Placa:** \`${placaTexto}\`${rolReservado ? '\n*(placa reservada)*' : ''}`
            ));

        await interaction.editReply({ components: [contenedor], flags: MessageFlags.IsComponentsV2 });
    },
};
