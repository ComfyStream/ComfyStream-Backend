const { Schema, model } = require('mongoose');

const zoomDatosReunionSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    eventoId: {
        type: Schema.Types.ObjectId,
        ref: 'Evento',
        required: true
    },
    uuid: {
        type: String,
        required: true
    },
    id: {
        type: String
    },
    host_id: {
        type: String,
        required: true
    },
    host_email: {
        type: String,
        required: true
    },
    topic: {
        type: String
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    start_time: {
        type: String
    },
    duration: {
        type: String,
        required: true
    },
    created_at: {
        type: String,
        required: true
    },
    start_url: {
        type: String
    },
    join_url: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


module.exports = model('zoomDatosReunion', zoomDatosReunionSchema);