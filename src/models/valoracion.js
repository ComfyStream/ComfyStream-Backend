const { Schema, model } = require("mongoose");

const valoracionSchema = new Schema({
    profesional: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    autor: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    mensaje: {
        type: String
    },
    estrellas: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    nombreAutor: {
        type: String,
        required: true
    },
    nombreProfesional: {
        type: String,
        required: true
    }
});

module.exports = model("Valoracion", valoracionSchema);