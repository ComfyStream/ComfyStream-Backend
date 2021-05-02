const { Router } = require("express");
const verificarToken = require("../tools/verificarToken");
const Evento = require("../models/evento");
const Asistencia = require("../models/asistencia");
const Valoracion = require("../models/valoracion");
const Usuario = require("../models/usuario");

const router = Router();

router.post("/valoracion/nueva", verificarToken, async(req, resp) => {
    const autor = req.usuario;
    const { id, mensaje, estrellas } = req.body;
    const profesional = await Usuario.findById(id);
    const misAsistencias = await Asistencia.find({ usuario: autor });
    const eventosProfesional = await Evento.find({ profesional });
    const misValoraciones = await Valoracion.find({ autor });

    let encontrado = false;
    for (let asistencia of misAsistencias) {
        let coinciden = eventosProfesional.filter((e) => String(e._id) === String(asistencia.evento._id));
        if (coinciden.length > 0) {
            coinciden = coinciden.filter((e) => new Date(e.fecha) < new Date());
            if (coinciden.length > 0) {
                encontrado = true;
                break;
            }
        }
    }

    if (!encontrado) {
        return resp.json({ msg: "No tienes asistencias para los eventos de este profesional" });
    }

    for (let valoracion of misValoraciones) {
        if (String(valoracion.profesional._id) === String(profesional._id)) {
            return resp.json({ msg: "Ya has valorado a este profesional" });
        }
    }

    Date.prototype.addHours = function(h) {
        this.setHours(this.getHours() + h);
        return this;
    };

    const fecha = new Date().addHours(2);
    const valoracion = await Valoracion.create({ autor, profesional, mensaje, estrellas, fecha, nombreAutor: autor.nombre, nombreProfesional: profesional.nombre });
    const valoracionesProfesional = await Valoracion.find({ profesional });
    let media = 0;

    for (let valoracion of valoracionesProfesional) {
        media += valoracion.estrellas;
    }

    media /= valoracionesProfesional.length;
    const usuarioAct = await Usuario.findByIdAndUpdate(id, { $set: { valoracionMedia: media, numeroValoraciones: valoracionesProfesional.length } }, { new: true });
    return resp.json({
        msg: "Valoración creada",
        valoracion,
        usuarioAct
    });
});

router.get("/puede-valorar/:id", verificarToken, async(req, resp) => {
    const autor = req.usuario;
    const { id } = req.params;
    const profesional = await Usuario.findById(id);
    const misAsistencias = await Asistencia.find({ usuario: autor });
    const eventosProfesional = await Evento.find({ profesional });
    const misValoraciones = await Valoracion.find({ autor });

    let encontrado = false;
    for (let asistencia of misAsistencias) {
        let coinciden = eventosProfesional.filter((e) => String(e._id) === String(asistencia.evento._id));
        if (coinciden.length > 0) {
            coinciden = coinciden.filter((e) => new Date(e.fecha) < new Date());
            if (coinciden.length > 0) {
                encontrado = true;
                break;
            }
        }
    }

    if (!encontrado) {
        return resp.json({ puede: false });
    }

    for (let valoracion of misValoraciones) {
        if (String(valoracion.profesional._id) === String(profesional._id)) {
            return resp.json({ puede: false });
        }
    }

    return resp.json({ puede: true });
});

router.delete("/valoracion/eliminar/:id", verificarToken, async(req, resp) => {
    const autor = req.usuario;
    const { id } = req.params;
    const valoracion = await Valoracion.findById(id);
    const profesional = valoracion.profesional;

    if (!valoracion) {
        return resp.json({ msg: "No existe la valoración" });
    }

    if (valoracion.autor !== autor._id) {
        return resp.json({ msg: "No has realizado esta valoración" });
    }

    await Valoracion.findByIdAndDelete(id);
    const valoracionesProfesional = await Valoracion.find({ profesional });

    let media = 0;
    for (let valoracion of valoracionesProfesional) {
        media += valoracion.estrellas;
    }

    media /= valoracionesProfesional.length;
    if (isNaN(media)) {
        await Usuario.findByIdAndUpdate(profesional, { $set: { valoracionMedia: 0, numeroValoraciones: 0 } }, { new: true });
    } else {
        await Usuario.findByIdAndUpdate(profesional, { $set: { valoracionMedia: media, numeroValoraciones: valoracionesProfesional.length } }, { new: true });
    }

    return resp.json({ msg: "Valoración eliminada" });
});

router.get("/valoraciones-recibidas/:id", async(req, resp) => {
    const { id } = req.params;
    const profesional = await Usuario.findById(id);
    const valoraciones = await Valoracion.find({ profesional });

    return resp.json({
        msg: "Exito",
        valoraciones
    });
});

router.get("/mis-valoraciones", verificarToken, async(req, resp) => {
    const autor = req.usuario;
    const valoraciones = await Valoracion.find({ autor });
    
    return resp.json({
        msg: "Exito",
        valoraciones
    });
});

module.exports = router;