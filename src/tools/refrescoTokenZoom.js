const got = require('got')

const ZoomDatosUsuarios = require('../models/zoomDatosUsuarios')

const ZOOM_CLIENT_ID = "BqYXOyymQ_OGhBXQKV653A";
const ZOOM_CLIENT_SECRET = "jvchOnsZAjVtHRAaYP7xEj95XaiwX6el";

function refrescoTokenZoom() {
    (async () => {
        try {

            const usuarios = await ZoomDatosUsuarios.find({}).exec()
            
            for (const usuario of usuarios) {
                if(usuario.refresh_token != null) {

                    const respuesta = await got.post('https://zoom.us/oauth/token'
                        + '?grant_type=refresh_token'
                        + '&refresh_token=' + usuario.refresh_token, {
                            headers: {
                                "Authorization": "Basic " + Buffer.from(ZOOM_CLIENT_ID + ':' + ZOOM_CLIENT_SECRET).toString('base64')
                            }
                        }
                    );
                
                    const datosParseados = JSON.parse(respuesta.body);

                    usuario.access_token = datosParseados.access_token;
                    usuario.refresh_token = datosParseados.refresh_token;
                    usuario.expires_in = datosParseados.expires_in;

                    usuario.save();
                }
            };
        } catch (error) {
            console.log("Error: " + error)
        }
    })();
    console.log("Tokens de Zoom actualizados correctamente !")
}

module.exports = refrescoTokenZoom