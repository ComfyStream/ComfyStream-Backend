const path = require("path");
const fs = require("fs");

class EventoFotos {

    constructor() {}

    asignarFoto(imagen, usuarioId, eventoId) {
        return new Promise((resolve, reject) => {
            const pathFoto = this.getCarpetaEventos(usuarioId);
            const nombreFoto = this.generarNombreUnico(eventoId, imagen.mimetype);
            imagen.mv(`${pathFoto}/${nombreFoto}`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    getCarpetaEventos(usuarioId) {
        const pathUsuario = this.getCarpetaUsuario(usuarioId);
        const pathFoto = `${pathUsuario}/eventos`;
        const existeFoto = fs.existsSync(pathFoto);
        if (!existeFoto) {
            fs.mkdirSync(pathFoto);
        }
        return pathFoto;
    }

    getCarpetaUsuario(usuarioId) {
        const pathUsuario = path.resolve(__dirname, "../uploads/", usuarioId);
        const existe = fs.existsSync(pathUsuario);
        if (!existe) {
            fs.mkdirSync(pathUsuario);
        }
        return pathUsuario;
    }

    generarNombreUnico(eventoId, tipo) {
        const arr = tipo.split("/");
        const ext = arr[arr.length - 1];
        return `${eventoId}.${ext}`;
    }

    getFoto(usuarioId, eventoId) {
        const pathEventos = this.getCarpetaEventos(usuarioId);
        const col = fs.readdirSync(pathEventos);
        const foto = col.filter((f) => f.includes(eventoId));
        return foto[0];
    }

}

module.exports = EventoFotos;