const { Router } = require('express')
const Evento = require('../models/evento')
const verificarToken = require('../tools/verificarToken')


const router = Router()

router.get('/eventos', async(req, resp) => {
    const eventos = await Evento.find()
    return resp.json({
        msg: '200 OK',
        eventos
    })
})
router.post('/evento', async(req, res) => {
    const { _id } = req.body
    const evento = await Evento.findById({ _id })
    return res.json({
        msg: '200 OK',
        evento
    })
})
router.get('/mis-eventos', verificarToken, async(req, res) => {
    const usuario = req.usuario
    const eventos = await Evento.find({ profesional: usuario._id })
    return res.json({
        msg: '200 OK',
        eventos
    })
})

module.exports = router