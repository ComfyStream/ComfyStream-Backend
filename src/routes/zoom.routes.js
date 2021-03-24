const { Router } = require('express')
const got = require('got')
const mongoose = require('mongoose');

const Usuario = require('../models/usuario')
const ZoomDatosUsuarios = require('../models/zoomDatosUsuarios')
const ZoomDatosReunion = require('../models/ZoomDatosReunion')

const ZOOM_CLIENT_ID = "BqYXOyymQ_OGhBXQKV653A";
const ZOOM_CLIENT_SECRET = "jvchOnsZAjVtHRAaYP7xEj95XaiwX6el";
const ZOOM_REDIRECT_URI = "http://localhost/landing"

const router = Router()

// Devuelve la URL en la que se solicita los datos de login de Zoom al usuario.
// Tras finalizar correctamente, devuelve un código en la url del landing page.
router.get('/zoom/token', async (req, res, next) => {
    try {
        const uri = 'https://zoom.us/oauth/authorize'
        + '?response_type=code'
        + '&client_id=' + ZOOM_CLIENT_ID
        + '&redirect_uri=' + ZOOM_REDIRECT_URI;

        return res.json({
            msg: "200 Ok",
            data: uri
        })
    } catch(e) {
        return next(e);
    }
});

// Procesado del código de zoom devuelto al landing page.
// Devuelve un token de acceso y uno de refresco, almacenados en la BD referidos al usuario.
router.post('/zoom/token', async (req, res, next) => {
    try {

        const respuesta = await got.post('https://zoom.us/oauth/token'
        + '?code=' + req.body.code
        + '&redirect_uri=' + ZOOM_REDIRECT_URI
        + '&grant_type=authorization_code', {
            headers: {
                "Authorization": "Basic " + Buffer.from(ZOOM_CLIENT_ID + ':' + ZOOM_CLIENT_SECRET).toString('base64')
            }
        });

        const datosParseados = JSON.parse(respuesta.body)

        const { email } = req.body
        const usuario = await Usuario.findOne({ email })

        const zoomDatosUsuarios = new ZoomDatosUsuarios({
            userId: usuario._id,
            access_token: datosParseados.access_token,
            refresh_token: datosParseados.refresh_token,
            expires_in: datosParseados.expires_in
        })

        await zoomDatosUsuarios.save()       

        return res.json({
            msg: "200 Ok",
            data: JSON.parse(respuesta.body),
            datos: zoomDatosUsuarios
        });
    } catch(e) {
        return next(e);
    }
});

// Refresca un token de Zoom a partir del correo del usuario
router.post('/zoom/token/refresh', async (req, res, next) => {
    try {
        const { email } = req.body
        const usuario = await Usuario.findOne({ email })
        
        const zoomDatosUsuarios = await ZoomDatosUsuarios.findOne({ userId: mongoose.Types.ObjectId(usuario._id) });
        
        const respuesta = await got.post('https://zoom.us/oauth/token'
            + '?grant_type=refresh_token'
            + '&refresh_token=' + zoomDatosUsuarios.refresh_token, {
                headers: {
                    "Authorization": "Basic " + Buffer.from(ZOOM_CLIENT_ID + ':' + ZOOM_CLIENT_SECRET).toString('base64')
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
    } catch(e) {
        return next(e)
    }
});

// Crea una reunión de Zoom para el usuario de nuestra web con "email" y 
// para el correo de su cuenta de Zoom con el resto de parámetros. 
// NOTA: Se pueden añadir más parámetros: https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/meetingcreate
/* Parámetros actuales:
    "email": "jescoevas@hotmail.com",
    "zoom_email": "comfystreamcontact@gmail.com",
    "topic": "Test",
    "type": 2,
    "start_time": "2021-03-24T16:54:14Z",
    "duration": 60
*/
router.post('/zoom/room', async (req, res, next) => {
    try {

        const { email } = req.body

        console.log('https://api.zoom.us/v2/users/' + req.body.email + '/meetings')
        const usuario = await Usuario.findOne({ email })

        const zoomDatosUsuarios = await ZoomDatosUsuarios.findOne({ userId: mongoose.Types.ObjectId(usuario._id) });

        const body = {
            "topic": req.body.topic,
            "type": req.body.type,
            "start_time": req.body.start_time,
            "duration": req.body.duration
        }

        const respuesta = await got.post('https://api.zoom.us/v2/users/' + req.body.zoom_email + '/meetings', {
            headers: {
                'Authorization': 'Bearer ' + zoomDatosUsuarios.access_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        const respuestaParseada = JSON.parse(respuesta.body)

        const zoomDatosReunion = new ZoomDatosReunion({
            userId: usuario._id,
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

    } catch(e) {
        return next(e);
    }
});

module.exports = router