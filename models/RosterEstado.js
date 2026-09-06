const mongoose = require('mongoose');

const rosterEstadoSchema = new mongoose.Schema({
    _id: { type: String, default: 'roster_placas' },
    mensajesIds: [String],
});

module.exports = mongoose.model('RosterEstado', rosterEstadoSchema);
