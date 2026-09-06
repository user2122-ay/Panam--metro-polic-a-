const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const config = require('../config.js');
const Placa = require('../models/Placa.js');
const ContadorPlaca = require('../models/ContadorPlaca.js');
const Postulacion = require('../models/Postulacion.js');
const { actualizarRoster } = require('../handlers/roster.js');

function formatearNombreRP(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 1) return partes[0];
    const inicial = partes[0][0].toUpperCase();
    const apellido = partes.slice(1).join(' ');
    return `${inicial}. ${apellido}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('placa')
        .setDescription('Asigna una placa oficial a un miembro')
        .addUserOption(opcion =>
            opcion.setName('usuario').setDescription('Miembro al que se le asignará la placa').setRequired(true)
        )
        .addStringOption(opcion =>
            opcion.setName('nombre').setDescription('Nombre completo del personaje (ej: Juan Mendoza)').setRequired(true)
        )
        .addStringOption(opcion =>
            opcion.setName('roblox').setDescription('Usuario de Roblox (opcional si ya tiene postulación aceptada)').setRequired(false)
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
        const nombreCompleto = interaction.options.getString('nombre');
        const robloxManual = interaction.options.getString('roblox');
        const Objetivo = await interaction.guild.members.fetch(usuarioObjetivo.id).catch(() => null);

        if (!Objetivo) {
            return interaction.editReply({ content: '⚠️ No pude encontrar a ese miembro en el servidor.' });
        }

        const nombreRP = formatearNombreRP(nombreCompleto);

        let letra = config.placas.letraDefault;
        for (const [rolId, letraSubdivision] of Object.entries(config.placas.subdivisiones)) {
            if (Objetivo.roles.cache.has(rolId)) {
                letra = letraSubdivision;
                break;
            }
        }

        let RobloxUsuario = robloxManual;
        if (!RobloxUsuario) {
            const postulacion = await Postulacion.findOne({ usuarioId: Objetivo.id, estado: 'aceptado' });
            RobloxUsuario = postulacion?.robloxUsuario || null;
        }

        const rolReservado = Object.keys(config.placas.reservadas || {}).find(rolId =>
            Objetivo.roles.cache.has(rolId)
        );

        let placaTexto, letraFinal = letra, numeroFinal;

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

        const apodoNuevo = `${placaTexto}|${nombreRP}`;

        try {
            await Objetivo.setNickname(apodoNuevo.slice(0, 32));
        } catch (error) {
            console.error('❌ Error cambiando apodo:', error);
            return interaction.editReply({ content: `⚠️ La placa se generó (**${placaTexto}**) pero no pude cambiar el apodo (puede tener un rol más alto que el bot).` });
        }

        await Placa.findOneAndUpdate(
            { usuarioId: usuarioObjetivo.id },
            {
                usuarioId: usuarioObjetivo.id,
                usuarioTag: usuarioObjetivo.tag,
                nombreRP,
                robloxUsuario: RobloxUsuario,
                placa: placaTexto,
                letra: letraFinal,
                numero: numeroFinal,
                asignadoPor: interaction.user.tag,
                fecha: new Date(),
            },
            { upsert: true }
        );

        await actualizarRoster(interaction.client);

        const contenedor = new ContainerBuilder()
            .setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 🪪 Placa asignada'))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Usuario:** <@${usuarioObjetivo.id}>\n**Nombre:** ${nombreRP}\n**Placa:** \`${placaTexto}\`${rolReservado ? '\n*(placa reservada)*' : ''}`
            ));

        await interaction.editReply({ components: [contenedor], flags: MessageFlags.IsComponentsV2 });
    },
};
