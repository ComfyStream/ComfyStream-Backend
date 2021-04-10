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
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    cuentaBancariaIBAN: {
        type: String,
        required: true
    },
    titularCuenta: {
        type: String,
        required: true
    }
});

usuarioSchema.pre("save", function(next) {
    this.password = bcryptjs.hashSync(this.password, 10)
    next()
});

usuarioSchema.method("compararPassword", async function(password) {
    return await bcryptjs.compareSync(password, this.password)
});

module.exports = model("Usuario", usuarioSchema);