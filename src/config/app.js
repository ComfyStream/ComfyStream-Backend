const express = require('express')
const cors = require('cors')

const { puerto } = require('./env')

const app = express()

//Configuracion
app.set('puerto', puerto)

//Middlewares
app.use(express.json())
app.use(cors({ origin: '*' }))

//Rutas
app.use('/comfystream/api', require('../routes/usuario.routes'))

//Inicio del servidor
function iniciarServidor() {
    app.listen(app.get('puerto'), () => console.log(`Servidor activo en puerto ${app.get('puerto')}`))
}

module.exports = {
    iniciarServidor
}