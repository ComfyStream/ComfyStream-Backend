const mongoose = require("mongoose");
const { baseDeDatos } = require("./env");

async function iniciarBaseDeDatos() {
    await mongoose.connect(baseDeDatos, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    console.log("Conectado a MongoDB");
}

module.exports = {
    iniciarBaseDeDatos
};