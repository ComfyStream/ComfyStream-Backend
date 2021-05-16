const { Router } = require("express");
const verificarToken = require("../tools/verificarToken");
const Evento = require("../models/evento");
const Asistencia = require("../models/asistencia");
const Usuario = require("../models/usuario");
const Suscripcion = require("../models/suscripcion");
const mongoose = require("mongoose");
const Token = require("../tools/token");

const router = Router();

router.post("/asistencia/nuevo", verificarToken, async(req, resp) => {
    const usuario = req.usuario;
    const evento = await Evento.findById(req.body.eventoId);
    let pagoPaypalUrl = req.body.pagoPaypalUrl;
    const fecha_compra = new Date();
    const { bonoAplicado, idProfesional } = req.body

    let usuarioActualizado = undefined
    if (bonoAplicado) {
        const bonos = usuario.bonos - 1;
        usuarioActualizado = await Usuario.findByIdAndUpdate(String(usuario._id), { $set: { bonos } }, { new: true });
    }

    if (!pagoPaypalUrl) {
        const profesional = await Usuario.findById(idProfesional);
        const suscripciones = await Suscripcion.find({ suscriptor: usuario, profesional }).sort({ fecha_expiracion: -1 });
        if (suscripciones && suscripciones.length > 0) {
            suscripcion = suscripciones[0];
            pagoPaypalUrl = suscripcion.pagoPaypalUrl;
        }
    }

    const asistencia = await Asistencia.create({ usuario, evento, pagoPaypalUrl, fecha_compra });
    return resp.json({
        msg: "Exito",
        asistencia,
        tokenActualizado: usuarioActualizado ? Token.getJwtToken(usuarioActualizado) : undefined
    });
});

router.get("/mis-asistencias", verificarToken, async(req, resp) => {
    const usuario = req.usuario;
    const asistencias = await Asistencia.find({ usuario }).populate("evento");
    let eventos = [];

    for (let asistencia of asistencias) {
        eventos.push(asistencia.evento);
    }
    return resp.json({
        eventos
    });
});

//Obtiene por evento: titulo_evento, asistente, profesional, fecha_compra, precio_evento, paypalId
router.get("/asistencias/pagos", verificarToken, async(req, res, next) => {
    const admin = req.usuario;
    if (admin.admin == false) {
        return next("Error, se requieren permisos de administrador");
    }

    const asistencias = [];
    const eventos = await Evento.find({});

    for (const evento of eventos) {
        const asistencias_evento = await Asistencia.find({ evento }).populate("evento");
        if (asistencias_evento.length == 0) {
            continue;
        }

        for (const asist of asistencias_evento) {
            const usuario = await Usuario.findById(mongoose.Types.ObjectId(asist.usuario));
            const profesional = await Usuario.findById(mongoose.Types.ObjectId(asist.evento.profesional));
            asistencias.push({
                "titulo_evento": asist.evento.titulo,
                "asistente": usuario.nombre,
                "profesional": profesional.nombre,
                "fecha_compra": asist.fecha_compra,
                "precio_evento": asist.evento.precio,
                "paypalId": asist.pagoPaypalUrl
            });
        }
    }

    return res.json({
        asistencias
    });
});

module.exports = router;