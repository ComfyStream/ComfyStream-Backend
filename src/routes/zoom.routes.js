const { Router } = require("express");
const got = require("got");
const mongoose = require("mongoose");
const verificarToken = require("../tools/verificarToken");

const ZoomDatosUsuarios = require("../models/zoomDatosUsuarios");
const ZoomDatosReunion = require("../models/zoomDatosReunion");

const ZOOM_CLIENT_ID = "VT5sHWdTTMalMXqMqxQ5g";
const ZOOM_CLIENT_SECRET = "I9MkD102Hq2VNO0chydCcTd77fpaX1F7";
const ZOOM_REDIRECT_URI = "https://comfystream-s3.web.app/landing";

const router = Router();

// Devuelve la URL en la que se solicita los datos de login de Zoom al usuario.
// Tras finalizar correctamente, devuelve un código en la url del landing page.
router.get("/zoom/token", async(req, res, next) => {
    const uri = "https://zoom.us/oauth/authorize" +
        "?response_type=code" +
        "&client_id=" + ZOOM_CLIENT_ID +
        "&redirect_uri=" + ZOOM_REDIRECT_URI;

    return res.json({
        msg: "200 Ok",
        data: uri
    });
});

// Procesado del código de zoom devuelto al landing page.
// Devuelve un token de acceso y uno de refresco, almacenados en la BD referidos al usuario.
router.post("/zoom/token", verificarToken, async(req, res, next) => {
    const respuesta = await got.post("https://zoom.us/oauth/token" +
        "?code=" + req.body.code +
        "&redirect_uri=" + ZOOM_REDIRECT_URI +
        "&grant_type=authorization_code", {
        headers: {
            "Authorization": "Basic " + Buffer.from(ZOOM_CLIENT_ID + ":" + ZOOM_CLIENT_SECRET).toString("base64")
        }
    });

    const datosParseados = JSON.parse(respuesta.body);

    const usuario = req.usuario;
    const preDatosZoom = await ZoomDatosUsuarios.findOne({ userId: mongoose.Types.ObjectId(usuario._id) });

    if (preDatosZoom) {
        return next(new Error("El usuario ya cuenta con datos de acceso a Zoom"));
    } 

    const zoomDatosUsuarios = new ZoomDatosUsuarios({
        userId: usuario._id,
        access_token: datosParseados.access_token,
        refresh_token: datosParseados.refresh_token,
        expires_in: datosParseados.expires_in
    });

    await zoomDatosUsuarios.save();

    return res.json({
        msg: "200 Ok",
        data: JSON.parse(respuesta.body)
    });
});

// Elimina los datos de Zoom (access_token, refresh_token, etc...) de un usuario por su email
router.delete("/zoom/token", verificarToken, async(req, res, next) => {
    const usuario = req.usuario;

    if (!usuario) {
        return next(new Error("No existen datos del usuario"));
    }
    
    const datosZoomUsuario = await ZoomDatosUsuarios.deleteOne({ userId: mongoose.Types.ObjectId(usuario._id) });
    if (datosZoomUsuario.deletedCount === 0) return next(new Error("No existen datos de Zoom del usuario"))

    return res.json({
        msg: "200 Ok",
        data: "Datos de Zoom del usuario eliminados correctamente"
    });
});

// Refresca un token de Zoom a partir del correo del usuario
router.post("/zoom/token/refresh", verificarToken, async(req, res) => {
    const usuario = req.usuario;
    const zoomDatosUsuarios = await ZoomDatosUsuarios.findOne({ userId: mongoose.Types.ObjectId(usuario._id) });

    const respuesta = await got.post("https://zoom.us/oauth/token" +
        "?grant_type=refresh_token" +
        "&refresh_token=" + zoomDatosUsuarios.refresh_token, {
            headers: {
                "Authorization": "Basic " + Buffer.from(ZOOM_CLIENT_ID + ":" + ZOOM_CLIENT_SECRET).toString("base64")
            }
        }
    );

    const datosParseados = JSON.parse(respuesta.body);

    zoomDatosUsuarios.access_token = datosParseados.access_token;
    zoomDatosUsuarios.refresh_token = datosParseados.refresh_token;
    zoomDatosUsuarios.expires_in = datosParseados.expires_in;

    zoomDatosUsuarios.save();

    return res.json({
        msg: "200 Ok",
        datos: zoomDatosUsuarios
    });
});

// Crea una reunión de Zoom para el usuario de nuestra web con "email" y 
// para el correo de su cuenta de Zoom con el resto de parámetros. 
router.post("/zoom/room", verificarToken, async(req, res) => {
    const usuario = req.usuario;
    const zoomDatosUsuarios = await ZoomDatosUsuarios.findOne({ userId: mongoose.Types.ObjectId(usuario._id) });

    const body = {
        "topic": req.body.titulo,
        "type": 2,
        "start_time": req.body.fecha,
        "duration": req.body.duracion,
        "waiting_room": true
    };

    const datosUsuario = await got.get("https://api.zoom.us/v2/users/me", {
        headers: {
            "Authorization": "Bearer " + zoomDatosUsuarios.access_token
        }
    });

    const respuesta = await got.post("https://api.zoom.us/v2/users/" + JSON.parse(datosUsuario.body)["email"] + "/meetings", {
        headers: {
            "Authorization": "Bearer " + zoomDatosUsuarios.access_token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const respuestaParseada = JSON.parse(respuesta.body);

    const zoomDatosReunion = new ZoomDatosReunion({
        userId: usuario._id,
        eventoId: req.body._id,
        uuid: respuestaParseada.uuid,
        id: respuestaParseada.id,
        host_id: respuestaParseada.host_id,
        host_email: respuestaParseada.host_email,
        topic: respuestaParseada.topic,
        type: respuestaParseada.type,
        status: respuestaParseada.status,
        start_time: respuestaParseada.start_time,
        duration: respuestaParseada.duration,
        created_at: respuestaParseada.created_at,
        start_url: respuestaParseada.start_url,
        join_url: respuestaParseada.join_url,
        password: respuestaParseada.password
    });

    await zoomDatosReunion.save();

    return res.json({
        msg: "200 Ok",
        datos: JSON.parse(respuesta.body)
    });
});

router.post("/zoom/datosReunion", verificarToken, async(req, res, next) => {
    const zoomDatosUsuarios = await ZoomDatosReunion.findOne({ eventoId: mongoose.Types.ObjectId(req.body.eventoId) });

    return res.json({
        msg: "200 Ok",
        zoomDatosUsuarios
    });
});

//Comprueba que el usuario logado tiene enlazado un usuario de zoom
router.get("/zoom/usuario-enlazado", verificarToken, async(req, resp) => {
    const usuario = req.usuario;
    const usuarioZoom = await ZoomDatosUsuarios.find({ userId: usuario });

    return resp.json({ 
        encontrado: usuarioZoom.length > 0 
    });
});

module.exports = router;