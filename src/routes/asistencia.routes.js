const { Router } = require("express");
const verificarToken = require("../tools/verificarToken");
const Evento = require("../models/evento");
const Asistencia = require("../models/asistencia");
const Usuario = require("../models/usuario");
const mongoose = require("mongoose");

const router = Router();

router.post("/asistencia/nuevo", verificarToken, async(req, resp) => {
    const usuario = req.usuario;
    const evento = await Evento.findById(req.body.eventoId);
    const pagoPaypalUrl = req.body.pagoPaypalUrl;
    const fecha_compra = new Date();
    const asistencia = await Asistencia.create({ usuario, evento, pagoPaypalUrl, fecha_compra});
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

//Obtiene por evento: ID de asistencia y hora de compra, ID y nombre del comprador, ID del profesional
//y título y precio del evento
router.post("/asistencias/pagos/id", async(req, resp) => {

    var eventos = [];

    const evento = req.body.eventoId;
    const asistencias = await Asistencia.find({ evento: evento }).populate("evento profesional");

    for(const asist of asistencias) {
        const usuario = await Usuario.findById(mongoose.Types.ObjectId(asist.usuario));
        eventos.push({
            "asistencia_id": asist._id,
            "fecha_compra": asist.fecha_compra,
            "comprador_id": usuario.id,
            "comprador_nombre": usuario.nombre,
            "profesional_id": asist.evento.profesional,
            "titulo_evento": asist.evento.titulo,
            "precio_evento": asist.evento.precio
        });
    }
    
    return resp.json({
        eventos
    });
})

module.exports = router;