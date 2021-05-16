const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const { puerto } = require("./env");
const refrescoTokenZoom = require("../tools/refrescoTokenZoom");

const app = express();

//Configuracion
app.set("puerto", puerto);

//Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

//Archivos
app.use(fileUpload());

//Rutas
app.use("/comfystream/api", require("../routes/usuario.routes"));
app.use("/comfystream/api", require("../routes/zoom.routes"));
app.use("/comfystream/api", require("../routes/evento.routes"));
app.use("/comfystream/api", require("../routes/asistencia.routes"));
app.use("/comfystream/api", require("../routes/chat.routes"));
app.use("/comfystream/api", require("../routes/valoracion.routes"));
app.use("/comfystream/api", require("../routes/suscripcion.routes"));

// Refrescamos los tokens de Zoom cada 30 minutos
setInterval(refrescoTokenZoom, 1000 * 60 * 30);


//Inicio del servidor
function iniciarServidor() {
    app.listen(app.get("puerto"), () => console.log(`Servidor activo en puerto ${app.get("puerto")}`));
}

module.exports = {
    iniciarServidor
};