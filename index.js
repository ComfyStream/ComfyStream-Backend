const { iniciarBaseDeDatos } = require("./src/config/database");
const { iniciarServidor } = require("./src/config/app");

function main() {
    iniciarBaseDeDatos();
    iniciarServidor();
}

main();