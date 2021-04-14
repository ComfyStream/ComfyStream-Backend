const { Router } = require("express");
const Evento = require("../models/evento");
const Usuario = require("../models/usuario");
const verificarToken = require("../tools/verificarToken");
const EventoFotos = require("../tools/evento-fotos");


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

router.post("/evento/nuevo", verificarToken, async(req, resp) => {
    if (!req.files)
        return resp.json({ msg: "No se han enviado archivos" });
    const { img } = req.files
    if (!img.mimetype.includes("image"))
        return resp.json({ msg: "No se ha subido ninguna imagen" });
    let datos = req.body;
    const idProfesional = req.usuario._id;
    const profesional = await Usuario.findById(idProfesional);
    datos.profesional = profesional;
    let evento = await Evento.create(datos);
    await eventoFotos.asignarFoto(img, String(profesional._id), String(evento._id));
    const fotoEvento = eventoFotos.getFoto(String(profesional._id), String(evento._id));
    evento = await Evento.findById(String(evento._id));
    evento.img = fotoEvento;
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

router.get("/buscador", async(req, res) => {
    const evento_buscado = req.body.titulo
    const eventos = await Evento.find({titulo:new RegExp(evento_buscado)}) 
    return res.json({
        msg: "200 OK",
        eventos
    });
})

module.exports = router;

