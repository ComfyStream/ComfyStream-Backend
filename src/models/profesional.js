const { Schema, model } = require('mongoose');

const ProfesionalSchema = Schema({

    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
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
    sector: {
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
    },
    img: {
        type: String
    },
    eventosId: [{
        type: Schema.Types.ObjectId,
        ref: 'Evento'
    }]


});
ProfesionalSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
})
module.exports = model('Profesional', ProfesionalSchema);