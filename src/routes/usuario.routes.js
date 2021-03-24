const { Router } = require('express')
const Usuario = require('../models/usuario')
const Token = require('../tools/token')

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



module.exports = router