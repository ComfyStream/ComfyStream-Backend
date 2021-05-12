const { Schema, model } = require("mongoose");
const bcryptjs = require("bcryptjs");

const usuarioSchema = Schema({

    nombre: {
        type: String,
        required: true
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    profesional: {
        type: Boolean,
        required: true
    },
    sector: {
        type: String,
    },
    descripcion: {
        type: String,
    },
    cuentaBancariaIBAN: {
        type: String,
    },
    titularCuenta: {
        type: String,
    },
    admin: {
        type: Boolean
    },
    valoracionMedia: {
        type: Number
    },
    urlConfirmacion: {
        type: String
    },
    confirmado: {
        type: Boolean
    },
    numeroValoraciones: {
        type: Number
    },
    bonos: {
        type: Number
    }
});

usuarioSchema.pre("save", function(next) {
    this.password = bcryptjs.hashSync(this.password, 10);
    next();
});

usuarioSchema.method("compararPassword", async function(password) {
    return await bcryptjs.compareSync(password, this.password);
});

module.exports = model("Usuario", usuarioSchema);