const mongoose = require('mongoose');

async function conectarMongo() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB correctamente');
    } catch (error) {
        console.error('❌ Error al conectar con MongoDB:', error);
        process.exit(1); // Si no conecta, no tiene sentido seguir corriendo el bot
    }
}

module.exports = { conectarMongo };
