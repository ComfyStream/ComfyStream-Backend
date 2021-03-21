const { Router, json } = require('express')
const Evento = require('../models/evento')
const verificarToken = require('../tools/verificarToken')


const router = Router()

router.get('/evento', async(res) => {
    const eventos = await Evento.find() 
    res.json(eventos)    
})
router.post('/evento', async(req, res) => {
    const {_id} = req.body
    const evento = await Evento.findById({_id})
    res.json(evento)
})
router.post('/evento/mios', verificarToken, async(req, res) =>{
    const usuario = req.usuario
    const evento = await Evento.find({profesional:usuario._id})
    res.json(evento)
})

module.exports = router