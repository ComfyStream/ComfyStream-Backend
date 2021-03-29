const { Router } = require('express');
const Usuario = require('../models/usuario');
const verificarToken = require('../tools/verificarToken');
const ZoomDatosUsuarios = require('../models/zoomDatosUsuarios');
const Token = require('../tools/token');
const zoomDatosUsuarios = require('../models/zoomDatosUsuarios');


const router = Router()

router.post('/login', async(req, res) => {
    const { email, password } = req.body
    const usuario = await Usuario.findOne({ email })
    if (!usuario)
        return res.json({ msg: "No se ha encontrado el usuario" })
            //const coincide = await usuario.compararPassword(password)
    const coincide = password == usuario.password
    if (!coincide)
        return res.json({ msg: "Password incorrecta" })
    res.json({
        msg: "Login realizado con exito",
        usuarioId: usuario._id,
        token: Token.getJwtToken(usuario),
        profesional: usuario.profesional
    })
})

router.get('/usuario',verificarToken, async(req, res) => {
    const usuario = req.usuario
    res.json({
        msg: "200 ok",
        usuario})
})


router.get('/usuarioZoom', verificarToken, async(req, res) => {
    const usuario = req.usuario

    const usuarioZoom = await ZoomDatosUsuarios.findOne({ userId: usuario })
    console.log(usuarioZoom);
    res.json({
        msg: "200 ok",
        usuarioZoom
    })
})
module.exports = router