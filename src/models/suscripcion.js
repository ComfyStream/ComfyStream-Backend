const { Schema, model } = require("mongoose");

const suscripcionSchema = Schema({

    suscriptor: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    profesional: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    pagoPaypalUrl: {
        type: String,
        required: true
    },
    fecha_compra: {
        type: Date,
        required: true
    },
    fecha_expiracion: {
        type: Date,
        required: true
    }

});


module.exports = model("Suscripcion", suscripcionSchema);