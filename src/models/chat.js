const { Schema, model } = require("mongoose");

const chatSchema = new Schema({
    usuario1: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },
    usuario2: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    }
});

module.exports = model("Chat", chatSchema);