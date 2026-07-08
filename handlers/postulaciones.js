const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');
const config = require('../config.js');
const Postulacion = require('../models/Postulacion.js');

// Guarda el progreso de cada usuario mientras llena el formulario
const estados = new Map();

function construirModalPreguntas(grupo) {
    const inicio = (grupo - 1) * 5 + 1;
    const fin = grupo * 5;
    const preguntasGrupo = config.postulaciones.preguntas.filter(p => p.n >= inicio && p.n <= fin);

    const modal = new ModalBuilder().setCustomId(`postulacion_modal_${grupo}`).setTitle(`Postulación - Parte ${grupo}/6`);

    for (const p of preguntasGrupo) {
        const input = new TextInputBuilder()
            .setCustomId(`preg_${p.n}`)
            .setLabel(p.texto.length > 45 ? p.texto.slice(0, 42) + '...' : p.texto)
            .setStyle(p.estilo === 'Paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(p.estilo === 'Paragraph' ? 500 : 100);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
    }
    return modal;
}

async function mostrarPrevio(interaction, grupo, esUpdate) {
    const inicio = (grupo - 1) * 5 + 1;
    const fin = grupo * 5;
    const preguntasGrupo = config.postulaciones.preguntas.filter(p => p.n >= inicio && p.n <= fin);
    const listaTexto = preguntasGrupo.map(p => `**${p.n}.** ${p.texto}${p.puntos > 0 ? ` *(${p.puntos} pts)*` : ''}`).join('\n');

    const contenedor = new ContainerBuilder()
        .setAccentColor(0x1E3A8A)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### 📋 Parte ${grupo}/6`))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(listaTexto))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('Presiona el botón para responder estas preguntas.'))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`postulacion_previo_${grupo}`).setLabel(grupo === 1 ? 'Comenzar' : 'Continuar').setStyle(ButtonStyle.Primary)
            )
        );

    const payload = { components: [contenedor], flags: MessageFlags.IsComponentsV2 };
    if (esUpdate) await interaction.update(payload);
    else await interaction.editReply(payload);
}

function construirMensajesFormulario(postulacion, usuarioMencion) {
    const mensajes = [];

    const encabezado = new ContainerBuilder()
        .setAccentColor(0xF59E0B)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('# 📝 Postulación'))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Discord:** ${usuarioMencion}\n**Roblox:** ${postulacion.robloxUsuario}`));

    if (postulacion.robloxAvatarUrl) {
        encabezado.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(postulacion.robloxAvatarUrl)));
    }
    mensajes.push(encabezado);

    for (let grupo = 1; grupo <= 6; grupo++) {
        const respuestasGrupo = postulacion.respuestas.slice((grupo - 1) * 5, grupo * 5);
        const contenedor = new ContainerBuilder().setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### Parte ${grupo}/6`));
        for (const r of respuestasGrupo) {
            contenedor.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${r.pregunta}**\n${r.respuesta}`));
        }
        mensajes.push(contenedor);
    }
    return mensajes;
}

// ---------- Flujo del postulante ----------

async function iniciarPostulacion(interaction) {
    if (interaction.member.roles.cache.has(config.postulaciones.roles.pendiente)) {
        return interaction.reply({ content: '⏳ Ya tienes una postulación pendiente de revisión.', ephemeral: true });
    }
    if (interaction.member.roles.cache.has(config.postulaciones.roles.aprobado)) {
        return interaction.reply({ content: '✅ Ya formas parte de la institución.', ephemeral: true });
    }

    const modal = new ModalBuilder().setCustomId('postulacion_roblox_modal').setTitle('Verificación de Roblox')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('roblox_usuario').setLabel('Tu nombre de usuario de Roblox').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(50)
            )
        );
    await interaction.showModal(modal);
}

async function manejarModalRoblox(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const usuario = interaction.fields.getTextInputValue('roblox_usuario').trim();

    try {
        const resUsuarios = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [usuario], excludeBannedUsers: false }),
        });
        const dataUsuarios = await resUsuarios.json();

        if (!dataUsuarios.data || dataUsuarios.data.length === 0) {
            return interaction.editReply({ content: `❌ No encontré ningún usuario de Roblox llamado **${usuario}**. Vuelve a presionar "Postularme" e intenta de nuevo.` });
        }

        const robloxUserId = dataUsuarios.data[0].id;
        const robloxNombreReal = dataUsuarios.data[0].name;

        const resThumb = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${robloxUserId}&size=420x420&format=Png&isCircular=false`);
        const dataThumb = await resThumb.json();
        const avatarUrl = dataThumb.data?.[0]?.imageUrl || null;

        estados.set(interaction.user.id, { robloxUsuario: robloxNombreReal, robloxUserId: String(robloxUserId), robloxAvatarUrl: avatarUrl, respuestas: {} });

        const contenedor = new ContainerBuilder()
            .setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 🔎 Verificación de Roblox'))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Encontré la cuenta **${robloxNombreReal}**. ¿Es este tu personaje?`));

        if (avatarUrl) {
            contenedor.addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(avatarUrl)));
        }

        contenedor.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('postulacion_roblox_si').setLabel('Sí, soy yo').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('postulacion_roblox_no').setLabel('No es mi usuario').setStyle(ButtonStyle.Danger)
            )
        );

        await interaction.editReply({ components: [contenedor], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
        console.error('❌ Error verificando Roblox:', error);
        await interaction.editReply({ content: '⚠️ Hubo un error consultando la API de Roblox. Intenta de nuevo más tarde.' });
    }
}

async function confirmarRobloxSi(interaction) {
    if (!estados.get(interaction.user.id)) {
        return interaction.update({ content: '⚠️ Tu sesión expiró, vuelve a presionar "Postularme".', components: [] });
    }
    await mostrarPrevio(interaction, 1, true);
}

async function confirmarRobloxNo(interaction) {
    estados.delete(interaction.user.id);
    await interaction.update({ content: '❌ Cancelado. Vuelve a presionar "Postularme" e ingresa tu usuario correcto.', components: [] });
}

async function mostrarModalDesdeBoton(interaction, grupo) {
    await interaction.showModal(construirModalPreguntas(grupo));
}

async function manejarModalPreguntas(interaction, grupo) {
    const estado = estados.get(interaction.user.id);
    if (!estado) {
        return interaction.reply({ content: '⚠️ Tu sesión expiró, vuelve a presionar "Postularme".', ephemeral: true });
    }

    const inicio = (grupo - 1) * 5 + 1;
    const fin = grupo * 5;
    const preguntasGrupo = config.postulaciones.preguntas.filter(p => p.n >= inicio && p.n <= fin);
    for (const p of preguntasGrupo) {
        estado.respuestas[p.n] = interaction.fields.getTextInputValue(`preg_${p.n}`);
    }

    await interaction.deferReply({ ephemeral: true });

    if (grupo < 6) {
        await mostrarPrevio(interaction, grupo + 1, false);
    } else {
        await finalizarPostulacion(interaction, estado);
    }
}

async function finalizarPostulacion(interaction, estado) {
    try {
        await interaction.member.roles.add(config.postulaciones.roles.pendiente);
    } catch (error) {
        console.error('❌ Error asignando rol pendiente:', error);
    }

    const respuestasOrdenadas = config.postulaciones.preguntas.map(p => ({
        pregunta: p.texto,
        respuesta: estado.respuestas[p.n] || '(sin responder)',
    }));

    const postulacion = await Postulacion.create({
        usuarioId: interaction.user.id,
        usuarioTag: interaction.user.tag,
        robloxUsuario: estado.robloxUsuario,
        robloxUserId: estado.robloxUserId,
        robloxAvatarUrl: estado.robloxAvatarUrl,
        respuestas: respuestasOrdenadas,
    });

    estados.delete(interaction.user.id);

    const canalPendientes = interaction.guild.channels.cache.get(config.postulaciones.canales.pendientes);
    if (canalPendientes) {
        const mensajes = construirMensajesFormulario(postulacion, interaction.user);
        for (const contenedor of mensajes) {
            await canalPendientes.send({ components: [contenedor], flags: MessageFlags.IsComponentsV2 });
        }

        const contenedorDecision = new ContainerBuilder()
            .setAccentColor(0xF59E0B)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ⚖️ Decisión sobre la postulación de ${postulacion.robloxUsuario}`))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`postulacion_aceptar_${postulacion._id}`).setLabel('Aceptar').setEmoji('✅').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`postulacion_rechazar_${postulacion._id}`).setLabel('Rechazar').setEmoji('❌').setStyle(ButtonStyle.Danger)
                )
            );
        await canalPendientes.send({ components: [contenedorDecision], flags: MessageFlags.IsComponentsV2 });
    }

    await interaction.editReply({ content: '✅ ¡Tu postulación fue enviada! Un miembro del equipo la revisará pronto.', components: [] });
}

// ---------- Flujo de revisión (Director General) ----------

async function manejarBotonDecision(interaction, decision, postulacionId) {
    const tienePermiso = interaction.member.roles.cache.some(rol =>
        config.postulaciones.rolesAutorizadosRevision.includes(rol.id)
    );

    if (!tienePermiso) {
        return interaction.reply({ content: '⛔ Solo un Oficial puede aceptar o rechazar postulaciones.', ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId(`postulacion_decision_modal_${decision}_${postulacionId}`)
        .setTitle(decision === 'aceptar' ? 'Aceptar postulación' : 'Rechazar postulación')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('puntuacion').setLabel('Puntuación total').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(3)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('observaciones').setLabel('Observaciones (opcional)').setStyle(TextInputStyle.Paragraph).setRequired(false).setMaxLength(500)
            )
        );
    await interaction.showModal(modal);
}

async function manejarModalDecision(interaction, decision, postulacionId) {
    await interaction.deferReply({ ephemeral: true });

    const postulacion = await Postulacion.findById(postulacionId);
    if (!postulacion) {
        return interaction.editReply({ content: '⚠️ No encontré esa postulación (puede que ya fue procesada).' });
    }

    const puntuacion = parseInt(interaction.fields.getTextInputValue('puntuacion').trim(), 10);
    if (isNaN(puntuacion)) {
        return interaction.editReply({ content: '⚠️ La puntuación debe ser un número.' });
    }
    const observaciones = interaction.fields.getTextInputValue('observaciones') || 'Sin observaciones.';
    const rango = config.postulaciones.rangoPuntuacion.find(r => puntuacion >= r.min && puntuacion <= r.max) || config.postulaciones.rangoPuntuacion.at(-1);

    postulacion.estado = decision === 'aceptar' ? 'aceptado' : 'rechazado';
    postulacion.puntuacionTotal = puntuacion;
    postulacion.categoria = rango.categoria;
    postulacion.observaciones = observaciones;
    postulacion.revisadoPor = interaction.user.tag;
    postulacion.fechaRevision = new Date();
    await postulacion.save();

    const guild = interaction.guild;
    const miembro = await guild.members.fetch(postulacion.usuarioId).catch(() => null);

    if (miembro) {
        try {
            await miembro.roles.remove(config.postulaciones.roles.pendiente);
            if (decision === 'aceptar') {
                await miembro.roles.add([config.postulaciones.roles.aprobado, config.postulaciones.roles.cadete]);
            } else {
                await miembro.roles.add(config.postulaciones.roles.rechazado);
            }
        } catch (error) {
            console.error('❌ Error actualizando roles tras decisión:', error);
        }

        const mensajeDM = decision === 'aceptar'
            ? `🎉 ¡Felicidades! Tu postulación fue **aceptada**.\n\n**Puntuación:** ${puntuacion} pts\n**Categoría:** ${rango.categoria}\n**Observaciones:** ${observaciones}\n\n¡Bienvenido, cadete!`
            : `Tu postulación fue **rechazada**.\n\n**Puntuación:** ${puntuacion} pts\n**Categoría:** ${rango.categoria}\n**Observaciones:** ${observaciones}\n\nPuedes volver a postularte más adelante.`;
        await miembro.send(mensajeDM).catch(() => console.log(`⚠️ No pude enviar DM a ${miembro.user.tag}.`));
    }

    const canalLog = guild.channels.cache.get(decision === 'aceptar' ? config.postulaciones.canales.logAceptados : config.postulaciones.canales.logRechazados);
    if (canalLog) {
        const contenedorLog = new ContainerBuilder()
            .setAccentColor(decision === 'aceptar' ? 0x22C55E : 0xEF4444)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${decision === 'aceptar' ? '✅ Postulación Aceptada' : '❌ Postulación Rechazada'}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Discord:** <@${postulacion.usuarioId}> (${postulacion.usuarioTag})\n**Roblox:** ${postulacion.robloxUsuario}\n**Puntuación:** ${puntuacion} pts\n**Categoría:** ${rango.categoria}\n**Observaciones:** ${observaciones}\n**Revisado por:** ${interaction.user.tag}`
            ));
        await canalLog.send({ components: [contenedorLog], flags: MessageFlags.IsComponentsV2 });

        const mensajesRespuestas = construirMensajesFormulario(postulacion, `<@${postulacion.usuarioId}>`);
        for (const contenedor of mensajesRespuestas) {
            await canalLog.send({ components: [contenedor], flags: MessageFlags.IsComponentsV2 });
        }
    }

    const canalResultados = guild.channels.cache.get(config.postulaciones.canales.resultados);
    if (canalResultados) {
        const contenedorResultado = new ContainerBuilder()
            .setAccentColor(decision === 'aceptar' ? 0x22C55E : 0xEF4444)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('### 📊 Resultado de Postulación'))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Roblox:** ${postulacion.robloxUsuario}\n**Puntuación total:** ${puntuacion} pts\n**Categoría:** ${rango.categoria}`));
        await canalResultados.send({ components: [contenedorResultado], flags: MessageFlags.IsComponentsV2 });
    }

    // Actualiza el mensaje original (el que tenía los botones Aceptar/Rechazar) quitando los botones
    if (interaction.message) {
        const contenedorFinal = new ContainerBuilder()
            .setAccentColor(decision === 'aceptar' ? 0x22C55E : 0xEF4444)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ⚖️ Postulación de ${postulacion.robloxUsuario}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `${decision === 'aceptar' ? '✅ **Aceptada**' : '❌ **Rechazada**'} por ${interaction.user.tag}\n**Puntuación:** ${puntuacion} pts — ${rango.categoria}`
            ));
        await interaction.message.edit({ components: [contenedorFinal], flags: MessageFlags.IsComponentsV2 }).catch(error => {
            console.error('❌ Error quitando botones del mensaje de decisión:', error);
        });
    }

    await interaction.editReply({ content: `✅ Postulación ${decision === 'aceptar' ? 'aceptada' : 'rechazada'} correctamente.` });
}

// ---------- Enrutadores ----------

async function manejarBoton(interaction) {
    const id = interaction.customId;
    if (id === 'postulacion_iniciar') return iniciarPostulacion(interaction);
    if (id === 'postulacion_roblox_si') return confirmarRobloxSi(interaction);
    if (id === 'postulacion_roblox_no') return confirmarRobloxNo(interaction);
    if (id.startsWith('postulacion_previo_')) return mostrarModalDesdeBoton(interaction, parseInt(id.replace('postulacion_previo_', ''), 10));
    if (id.startsWith('postulacion_aceptar_')) return manejarBotonDecision(interaction, 'aceptar', id.replace('postulacion_aceptar_', ''));
    if (id.startsWith('postulacion_rechazar_')) return manejarBotonDecision(interaction, 'rechazar', id.replace('postulacion_rechazar_', ''));
}

async function manejarModal(interaction) {
    const id = interaction.customId;
    if (id === 'postulacion_roblox_modal') return manejarModalRoblox(interaction);
    if (id.startsWith('postulacion_modal_')) return manejarModalPreguntas(interaction, parseInt(id.replace('postulacion_modal_', ''), 10));
    if (id.startsWith('postulacion_decision_modal_aceptar_')) return manejarModalDecision(interaction, 'aceptar', id.replace('postulacion_decision_modal_aceptar_', ''));
    if (id.startsWith('postulacion_decision_modal_rechazar_')) return manejarModalDecision(interaction, 'rechazar', id.replace('postulacion_decision_modal_rechazar_', ''));
}

module.exports = { manejarBoton, manejarModal };
