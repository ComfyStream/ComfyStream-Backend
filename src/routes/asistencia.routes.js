const { Router } = require("express");
const verificarToken = require("../tools/verificarToken");
const Evento = require("../models/evento");
const Asistencia = require("../models/asistencia");

const router = Router();

router.post("/asistencia/nuevo", verificarToken, async(req, resp) => {
    const usuario = req.usuario;
    const evento = await Evento.findById(req.body.eventoId);
    const pagoPaypalUrl = req.body.pagoPaypalUrl;
    const asistencia = await Asistencia.create({ usuario, evento, pagoPaypalUrl });
    return resp.json({
        msg: "Exito",
        asistencia
    });
})

router.get("/mis-asistencias", verificarToken, async(req, resp) => {
    const usuario = req.usuario;
    const asistencias = await Asistencia.find({ usuario }).populate("evento");
    let eventos = [];
    for (let i = 0; i < asistencias.length; i++) {
        const asistencia = asistencias[i];
        eventos.push(asistencia.evento);
    }
    return resp.json({
        eventos
    });
})

//Obtiene todas las asistencias (id, evento y url de pago)
router.get("/asistencias/pagos", async(req, resp) => {
    const asistencias = await Asistencia.find({ }).populate("evento");
    
    return resp.json({
        asistencias
    });
})

//Obtiene asistencias (id, evento y url de pago) por id de usuario
router.post("/asistencias/pagos/id", async(req, resp) => {
    const usuario = req.body.usuario;
    const asistencias = await Asistencia.find({ usuario }).populate("evento");
    
    return resp.json({
        asistencias
    });
})

module.exports = router;