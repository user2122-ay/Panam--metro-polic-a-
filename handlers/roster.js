const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const config = require('../config.js');
const Placa = require('../models/Placa.js');
const RosterEstado = require('../models/RosterEstado.js');

const COLORES = {
    A: 0x3B82F6, // Policía Nacional
    D: 0xF59E0B, // Alto Mando (reservadas)
};
const COLOR_SUBDIVISION = 0x6366F1;

function nombreDeSerie(letra) {
    if (letra === config.placas.letraDefault) return 'Policía Nacional';
    if (letra === 'D') return 'Alto Mando';
    const entrada = Object.entries(config.placas.subdivisiones).find(([, l]) => l === letra);
    if (!entrada) return `Serie ${letra}`;
    const unidad = config.jerarquia.unidades.find(u => u.id === entrada[0]);
    return unidad ? unidad.nombre : `Serie ${letra}`;
}

async function construirComponentes() {
    const placas = await Placa.find({}).sort({ numero: 1 });

    const letrasReservadas = Object.values(config.placas.reservadas || {}).map(p => p.split('-')[0].replace(/[0-9]/g, ''));
    const letrasSubdivisiones = Object.values(config.placas.subdivisiones);
    const letrasUnicas = [...new Set([config.placas.letraDefault, ...letrasSubdivisiones, ...letrasReservadas])];

    const componentes = [
        new ContainerBuilder()
            .setAccentColor(0x1E3A8A)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# 🪪 Registro de Placas'))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`Actualizado automáticamente • ${placas.length} placa(s) activa(s)`)),
    ];

    for (const letra of letrasUnicas) {
        const placasDeLaSerie = placas.filter(p => p.letra === letra);
        const contenedor = new ContainerBuilder()
            .setAccentColor(COLORES[letra] || COLOR_SUBDIVISION)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${nombreDeSerie(letra)} (Serie ${letra})`));

        if (placasDeLaSerie.length === 0) {
            contenedor.addTextDisplayComponents(new TextDisplayBuilder().setContent('*Sin miembros asignados.*'));
        } else {
            const lista = placasDeLaSerie.map(p => `\`${p.placa}\` — ${p.nombreRP || p.robloxUsuario}`).join('\n');
            contenedor.addTextDisplayComponents(new TextDisplayBuilder().setContent(lista));
        }
        componentes.push(contenedor);
    }

    return componentes;
}

async function actualizarRoster(client) {
    const canal = await client.channels.fetch(config.placas.canalRoster).catch(() => null);
    if (!canal) return console.error('❌ No encontré el canal del roster de placas.');

    const componentes = await construirComponentes();
    let estado = await RosterEstado.findById('roster_placas');
    if (!estado) estado = new RosterEstado({ _id: 'roster_placas', mensajesIds: [] });

    for (const id of estado.mensajesIds) {
        const msg = await canal.messages.fetch(id).catch(() => null);
        if (msg) await msg.delete().catch(() => {});
    }

    const nuevosIds = [];
    for (const componente of componentes) {
        const msg = await canal.send({ components: [componente], flags: MessageFlags.IsComponentsV2 });
        nuevosIds.push(msg.id);
    }

    estado.mensajesIds = nuevosIds;
    await estado.save();
}

module.exports = { actualizarRoster };
