const mongoose = require('mongoose');

const respuestaSchema = new mongoose.Schema({
    pregunta: String,
    respuesta: String,
}, { _id: false });

const postulacionSchema = new mongoose.Schema({
    usuarioId: { type: String, required: true },
    usuarioTag: String,
    robloxUsuario: String,
    robloxUserId: String,
    robloxAvatarUrl: String,
    respuestas: [respuestaSchema],
    estado: { type: String, enum: ['pendiente', 'aceptado', 'rechazado'], default: 'pendiente' },
    puntuacionTotal: Number,
    categoria: String,
    observaciones: String,
    revisadoPor: String,
    fechaEnvio: { type: Date, default: Date.now },
    fechaRevision: Date,
});

module.exports = mongoose.model('Postulacion', postulacionSchema);
