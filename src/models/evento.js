const { Schema, model } = require('mongoose');

const eventoSchema = Schema({

    imagenes: [{
        type: String
    }],
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true
    },
    subCategoria: {
        type: String,
    },
    precio: {
        type: Number,
        required: true
    },
    esPersonal: {
        type: Boolean,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    enlace: {
        type: String,
        required: true
    },
    profesional: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});


module.exports = model('Evento', eventoSchema);