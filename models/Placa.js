const mongoose = require('mongoose');

const placaSchema = new mongoose.Schema({
    usuarioId: { type: String, required: true, unique: true },
    usuarioTag: String,
    robloxUsuario: String,
    placa: { type: String, required: true },
    letra: String,
    numero: Number,
    asignadoPor: String,
    fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Placa', placaSchema);
