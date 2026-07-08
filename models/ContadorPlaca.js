const mongoose = require('mongoose');

const contadorSchema = new mongoose.Schema({
    letra: { type: String, required: true, unique: true },
    ultimoNumero: { type: Number, default: 0 },
});

module.exports = mongoose.model('ContadorPlaca', contadorSchema);
