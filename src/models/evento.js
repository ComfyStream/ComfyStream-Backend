const { Schema, model } = require('mongoose');


const EventoSchema = Schema({

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
        type: String,
        required: true
    },
    enlace: {
        type: String,
        required: true
    },
    proveedor: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Proveedor'
    }

});

EventoSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
})


module.exports = model('Evento', EventoSchema);