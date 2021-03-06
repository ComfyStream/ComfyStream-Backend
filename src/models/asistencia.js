const { Schema, model } = require("mongoose");

const asistenciaSchema = Schema({

    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    evento: {
        type: Schema.Types.ObjectId,
        ref: "Evento"
    },
    pagoPaypalUrl: {
        type: String,
        required: true
    },
    fecha_compra: {
        type: Date,
        required: true
    }

});


module.exports = model("Asistencia", asistenciaSchema);