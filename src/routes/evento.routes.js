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
router.get("/evento/disponibles", verificarToken, async(req, res, next) => {
    try {

        var respuesta = [];

        const eventos = await Evento.find({ fecha: { $gte: new Date()} });

        for (const evento of eventos) {
            if (evento.esPersonal) {
                const check = await Asistencia.find({ evento: mongoose.Types.ObjectId(evento._id) });
                if (check.length == 0) {
                    respuesta.push(evento);
                }
            } else {
                respuesta.push(evento)
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
    // if (!req.files)
    //     return resp.json({ msg: "No se han enviado archivos" });
    // const { img } = req.files
    // if (!img.mimetype.includes("image"))
    //     return resp.json({ msg: "No se ha subido ninguna imagen" });
    let datos = req.body;
    const idProfesional = req.usuario._id;
    const profesional = await Usuario.findById(idProfesional);
    datos.profesional = profesional;
    let evento = await Evento.create(datos);
    // await eventoFotos.asignarFoto(img, String(profesional._id), String(evento._id));
    // const fotoEvento = eventoFotos.getFoto(String(profesional._id), String(evento._id));
    evento = await Evento.findById(String(evento._id));
    // evento.img = fotoEvento;
    await Evento.findByIdAndUpdate(String(evento._id), evento, { new: true });
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

module.exports = router;