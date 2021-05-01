const express = require("express");
const Token = require("./token");

const verificarToken = (req, res, next) => {
    const token = req.get("x-token") || "";
    Token.compararToken(token).then((decoded) => {
        req.usuario = decoded.usuario;
        next();
    }).catch(err => {
        res.json({
            msg: "Token incorrecto"
        });
    });
};

module.exports = verificarToken;