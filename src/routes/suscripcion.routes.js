const { Router } = require("express");
const verificarToken = require("../tools/verificarToken");
const Suscripcion = require("../models/suscripcion");
const Usuario = require("../models/usuario");

const router = Router();

router.post("/nueva-suscripcion", verificarToken, async(req, resp) => {

    const suscriptor = req.usuario;
    const { idProfesional, pagoPaypalUrl } = req.body;
    const profesional = await Usuario.findById(idProfesional);

    const fecha_compra = new Date();
    let fecha_expiracion = new Date();
    fecha_expiracion.setMonth(fecha_expiracion.getMonth() + 1);
    fecha_compra.setHours(fecha_compra.getHours() + 2);
    fecha_expiracion.setHours(fecha_expiracion.getHours() + 2);

    const suscripcion = await Suscripcion.create({ suscriptor, profesional, pagoPaypalUrl, fecha_compra, fecha_expiracion });

    return resp.json({
        msg: "Exito",
        suscripcion
    });

});

router.get("/esta-suscrito/:idProfesional", verificarToken, async(req, resp) => {

    const suscriptor = req.usuario;
    const { idProfesional } = req.params;
    const profesional = await Usuario.findById(idProfesional);
    let suscrito = false;
    let suscripcion = undefined;

    const suscripciones = await Suscripcion.find({ suscriptor, profesional }).sort({ fecha_expiracion: -1 });
    if (suscripciones && suscripciones.length > 0) {
        suscripcion = suscripciones[0];
        let hoy = new Date();
        hoy.setHours(hoy.getHours() + 2);
        suscrito = suscripcion.fecha_expiracion > hoy;
    }

    return resp.json({
        suscrito,
        suscripcion
    })

});

router.get("/suscriptores", verificarToken, async(req, resp) => {
    const profesional = req.usuario
    let suscripciones = await Suscripcion.find({ profesional });
    suscripciones = suscripciones.filter(s => {
        let hoy = new Date();
        hoy.setHours(hoy.getHours() + 2);
        return s.fecha_expiracion >= hoy;
    });
    let suscriptores = [];
    let ids = [];

    for (let i = 0; i < suscripciones.length; i++) {
        const suscripcion = suscripciones[i];
        let suscriptor = String(suscripcion.suscriptor);
        if (!ids.includes(suscriptor)) {
            ids.push(suscriptor);
            suscriptor = await Usuario.findById(suscripcion.suscriptor);
            const datos = { usuario: suscriptor, suscripcion };
            suscriptores.push(datos);
        }
    }

    return resp.json({ suscriptores });

});

router.get("/suscripciones", verificarToken, async(req, resp) => {
    const suscriptor = req.usuario;
    let suscripciones = await Suscripcion.find({ suscriptor });
    suscripciones = suscripciones.filter(s => {
        let hoy = new Date();
        hoy.setHours(hoy.getHours() + 2);
        return s.fecha_expiracion >= hoy;
    });
    let profesionales = [];
    let ids = [];

    for (let i = 0; i < suscripciones.length; i++) {
        const suscripcion = suscripciones[i];
        let profesional = String(suscripcion.profesional);
        if (!ids.includes(profesional)) {
            ids.push(profesional);
            profesional = await Usuario.findById(suscripcion.profesional);
            const datos = { usuario: profesional, suscripcion };
            profesionales.push(datos);
        }
    }

    return resp.json({ profesionales });

});

module.exports = router;