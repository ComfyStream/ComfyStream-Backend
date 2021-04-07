const { Schema, model } = require("mongoose");

const mensajeSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: "Chat"
    },
    autor: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    cuerpo: {
        type: String,
        required: [true, "Cuerpo necesario"]
    },
    fecha: {
        type: Date,
        default: new Date()
    },
});

module.exports = model("Mensaje", mensajeSchema);