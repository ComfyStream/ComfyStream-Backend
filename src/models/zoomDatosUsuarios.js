const { Schema, model } = require("mongoose");

const zoomDatosUsuariosSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    access_token: {
        type: String,
        required: true
    },
    refresh_token: {
        type: String
    },
    expires_in: {
        type: String,
        required: true
    }
});


module.exports = model("ZoomDatosUsuarios", zoomDatosUsuariosSchema);