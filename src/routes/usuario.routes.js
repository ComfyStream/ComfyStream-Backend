const { Router } = require("express");
const Usuario = require("../models/usuario");
const verificarToken = require("../tools/verificarToken");
const ZoomDatosUsuarios = require("../models/zoomDatosUsuarios");
const Token = require("../tools/token");
const zoomDatosUsuarios = require("../models/zoomDatosUsuarios");


const router = Router();

router.post("/login", async(req, res) => {
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (!usuario)
        return res.json({ msg: "No se ha encontrado el usuario" });
    //const coincide = await usuario.compararPassword(password)
    const coincide = req.body.password == usuario.password;
    if (!coincide)
        return res.json({ msg: "Password incorrecta" });
    res.json({
        msg: "Login realizado con exito",
        usuarioId: usuario._id,
        token: Token.getJwtToken(usuario),
        profesional: usuario.profesional
    });
})

router.get("/usuario", verificarToken, async(req, res) => {
    const usuario = req.usuario;
    res.json({
        msg: "200 ok",
        usuario
    });
})

router.get("/usuario/:id", async(req, res) => {
    const usuario = await Usuario.findById(req.params.id);
    res.json({
        msg: "200 ok",
        usuario: usuario.nombre
    });
})


router.get("/usuarioZoom", verificarToken, async(req, res) => {
    const usuario = req.usuario;

    const usuarioZoom = await ZoomDatosUsuarios.findOne({ userId: usuario });
    res.json({
        msg: "200 ok",
        usuarioZoom
    });
})

module.exports = router;