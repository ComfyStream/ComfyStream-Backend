const { Router } = require("express");
const Evento = require("../models/evento");
const Usuario = require("../models/usuario");
const Asistencia = require("../models/asistencia");
const verificarToken = require("../tools/verificarToken");
const EventoFotos = require("../tools/evento-fotos");
const mongoose = require("mongoose");

const router = Router();
const eventoFotos = new EventoFotos();

router.get("/eventos", async(req, resp) => {
    const eventos = await Evento.find();
    return resp.json({
        msg: "200 OK",
        eventos
    });
})
router.post("/evento", async(req, res) => {
    const evento = await Evento.findById(req.body._id)
    return res.json({
        msg: "200 OK",
        evento
    });
})
router.get("/mis-eventos", verificarToken, async(req, res) => {
    const usuario = req.usuario;
    const eventos = await Evento.find({ profesional: usuario._id });
    return res.json({
        msg: "200 OK",
        eventos
    });
})

// Obtiene los usuarios que asisten al evento pasado como parámetro
router.post("/evento/asistentes", verificarToken, async(req, res) => {

    const eventoId = req.body.eventoId;
    var asistentes = []

    const idAsistentes = await Asistencia.find({ evento: mongoose.Types.ObjectId(eventoId) });

    for (const asistente of idAsistentes) {
        const user = await Usuario.findById(asistente.usuario).select({ email: 1, img: 1, profesional: 1, nombre: 1 });
        asistentes.push(user);
    }

    return res.json({
        msg: "200 OK",
        asistentes
    });
})

// Obtener los eventos disponibles: Fecha superior a hoy + si personal que no esté cogido
router.get("/evento/disponibles", async(req, res, next) => {
    try {

        var respuesta = [];

        const eventos = await Evento.find({ fecha: { $gte: new Date() } });

        for (const evento of eventos) {
            if (evento.esPersonal) {
                const check = await Asistencia.find({ evento: mongoose.Types.ObjectId(evento._id) });
                if (check.length == 0) {
                    respuesta.push(evento);
                }
            } else {
                respuesta.push(evento);
            }
        }

        return res.json({
            respuesta
        })
    } catch (e) {
        return next(e)
    }
});

router.post("/evento/nuevo", verificarToken, async(req, resp) => {
    let datos = req.body;
    const idProfesional = req.usuario._id;
    const profesional = await Usuario.findById(idProfesional);
    datos.profesional = profesional;
    let evento = await Evento.create(datos);
    resp.json({
        msg: "Exito",
        evento
    });
})

router.post("/evento/editar", verificarToken, async(req, resp) => {
    const profesional = req.usuario;
    const { id } = req.body;
    const misEventos = await Evento.find({ profesional });
    const encontrado = misEventos.filter(e => e._id == id);
    if (encontrado.length == 0) {
        return resp.json({ msg: "El evento no es tuyo" })
    }
    const evento = await Evento.findByIdAndUpdate(id, req.body, { new: true })
    resp.json({
        msg: "Exito",
        evento
    });
})

router.get("/:usuarioId/:eventoId/img", (req, res) => {
    const path = eventoFotos.getCarpetaEventos(req.params.usuarioId);
    const foto = eventoFotos.getFoto(usuarioId, req.params.eventoId);
    const pathCompleto = `${path}/${foto}`;
    res.sendFile(pathCompleto);
})

router.delete("/evento/eliminar", verificarToken, async(req, resp) => {
    const { id } = req.body;
    const evento = await Evento.findById(id);
    const usuario = req.usuario;
    if (usuario._id != evento.profesional) {
        return resp.json({ msg: "No es un evento tuyo" });
    }

    const asistencias = await Asistencia.find({ evento });
    if (asistencias.length > 0) {
        return resp.json({ msg: "Este eventos ya tiene asistencias" })
    }

    await Evento.findByIdAndDelete(id);

    return resp.json({ msg: "Borrado con éxito" });
})

module.exports = router;