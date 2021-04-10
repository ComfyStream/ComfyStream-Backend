const { Router } = require("express");
const Usuario = require("../models/usuario");
const verificarToken = require("../tools/verificarToken");
const ZoomDatosUsuarios = require("../models/zoomDatosUsuarios");
const Token = require("../tools/token");
const UsuarioFotos = require('../tools/usuario-fotos')

const usuarioFotos = new UsuarioFotos()

const router = Router();

router.post("/login", async(req, res) => {
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (!usuario)
        return res.json({ msg: "No se ha encontrado el usuario" });
    const coincide = await usuario.compararPassword(req.body.password)
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

router.post("/registro", async(req, resp) => {

    if (!req.files)
        return res.json({ msg: "No se han enviado archivos" })
    const { img } = req.files
    if (!img.mimetype.includes('image'))
        return res.json({ msg: "No se ha subido ninguna imagen" })

    const { email, cuentaBancariaIBAN } = req.body
    const emailEncontrado = await Usuario.find({ email })
    const bancoEncontrado = await Usuario.find({ cuentaBancariaIBAN })

    if (emailEncontrado.length > 0 && bancoEncontrado.length > 0) {
        return resp.json({
            msg: "El email y la cuenta bancaria ya están en uso"
        })
    } else if (emailEncontrado.length > 0) {
        return resp.json({
            msg: "El email ya está en uso"
        })
    } else if (bancoEncontrado.length > 0) {
        return resp.json({
            msg: "Esta cuenta bancaria ya está en uso"
        })
    } else {
        const usuario = await Usuario.create(req.body)
        await usuarioFotos.asignarFoto(img, String(usuario._id))
        const fotoUsuario = usuarioFotos.getFoto(String(usuario._id))
        usuario.img = fotoUsuario
        await Usuario.findByIdAndUpdate(String(usuario._id), usuario, { new: true })
        return resp.json({
            msg: "Registro realizado con éxito",
            usuario,
            token: Token.getJwtToken(usuario)
        })
    }
})


module.exports = router;