const { Router } = require("express");
const Usuario = require("../models/usuario");
const verificarToken = require("../tools/verificarToken");
const ZoomDatosUsuarios = require("../models/zoomDatosUsuarios");
const Token = require("../tools/token");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = Router();

router.post("/login", async(req, res) => {
    const usuario = await Usuario.findOne({ email: req.body.email });
    if (!usuario) {
        return res.json({ msg: "No se ha encontrado el usuario" });
    }

    const coincide = await usuario.compararPassword(req.body.password);
    if (!coincide) {
        return res.json({ msg: "Password incorrecta" });
    }

    if (!usuario.confirmado) {
        return res.json({ msg: "Debe confirmar su cuenta" });
    }

    return res.json({
        msg: "Login realizado con exito",
        usuarioId: usuario._id,
        token: Token.getJwtToken(usuario),
        profesional: usuario.profesional
    });
});

router.get("/usuario", verificarToken, async(req, res) => {
    const usuario = req.usuario;

    res.json({
        msg: "200 ok",
        usuario
    });
});

router.get("/usuario/:id", async(req, res) => {
    const usuario = await Usuario.findById(req.params.id);

    res.json({
        msg: "200 ok",
        usuario
    });
});

router.get("/usuarioZoom", verificarToken, async(req, res) => {
    const usuario = req.usuario;

    const usuarioZoom = await ZoomDatosUsuarios.findOne({ userId: usuario });
    res.json({
        msg: "200 ok",
        usuarioZoom
    });
});

router.post("/registro", async(req, resp) => {
    let datos = req.body;
    datos.valoracionMedia = 0;
    datos.bonos = 0;
    const { email, cuentaBancariaIBAN } = req.body;
    const emailEncontrado = await Usuario.find({ email });
    const bancoEncontrado = await Usuario.find({ cuentaBancariaIBAN });

    if (emailEncontrado.length > 0) {
        return resp.json({
            msg: "El email ya está en uso"
        });
    } else if (cuentaBancariaIBAN && bancoEncontrado.length > 0) {
        return resp.json({
            msg: "Esta cuenta bancaria ya está en uso"
        });
    } else {
        datos.urlConfirmacion = crypto.randomBytes(100).toString("hex");
        datos.confirmado = false;

        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "comfystreamcontact@gmail.com",
                pass: "Grupo2ispp."
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: "comfystreamcontact@gmail.com",
            to: email,
            subject: "Confirmación de cuenta de usuario de ComfyStream",
            html: `<p>
            ¡Muy buenas! Haz click en la siguiente ruta para confirmar tu cuenta de usuario: 
            <a href="https://comfystream-ppl.web.app/confirmar/${datos.urlConfirmacion}">https://comfystream-ppl.web.app/confirmar/${datos.urlConfirmacion}</a>
            </p>`
        };

        transporter.sendMail(mailOptions, async function(error, info) {
            if (error) {
                return resp.json({ msg: error.message });
            } else {
                const usuario = await Usuario.create(datos);
                return resp.json({
                    msg: "Registro realizado con éxito",
                    usuario,
                    token: Token.getJwtToken(usuario)
                });
            }
        });
    }
});

router.post("/editar-perfil", verificarToken, async(req, resp) => {
    const usuario = req.usuario;
    const { email, cuentaBancariaIBAN, password } = req.body;
    const emailEncontrado = await Usuario.find({ email });
    const bancoEncontrado = await Usuario.find({ cuentaBancariaIBAN });

    if (emailEncontrado.length > 0 && email !== usuario.email) {
        return resp.json({
            msg: "El email ya está en uso"
        });
    } else if (bancoEncontrado.length > 0 && cuentaBancariaIBAN !== usuario.cuentaBancariaIBAN && cuentaBancariaIBAN) {
        return resp.json({
            msg: "Esta cuenta bancaria ya está en uso"
        });
    } else {
        if (password) {
            req.body.password = bcryptjs.hashSync(password, 10);
        }
        const usuarioActualizado = await Usuario.findByIdAndUpdate(String(usuario._id), req.body, { new: true });

        return resp.json({
            msg: "Perfil actualizado con éxito",
            usuarioActualizado,
            token: Token.getJwtToken(usuarioActualizado)
        });
    }
});

router.put("/confirmar/:urlConfirmacion", async(req, resp) => {
    const { urlConfirmacion } = req.params;
    const usuario = await Usuario.find({ urlConfirmacion });
    const usuarioActualizado = await Usuario.findByIdAndUpdate(String(usuario[0]._id), { $set: { confirmado: true } }, { new: true });

    return resp.json({
        msg: "Usuario confirmado",
        usuarioActualizado
    });
});

router.post("/usuario/cambiar/pass", verificarToken, async(req, resp, next) => {
    const { nuevaPassword, password } = req.body;

    const usuario = await Usuario.findOne({ email: req.usuario.email });

    const coincide = await usuario.compararPassword(password);
    if (!coincide) {
        return resp.json({ msg: "Password incorrecta" });
    } else {
        usuario.password = nuevaPassword;

        await usuario.save();

        return resp.json({
            msg: "Contraseña actualizada con éxito",
            usuario
        });
    }
});

router.post("/usuario/cambiar/banco", verificarToken, async(req, resp, next) => {
    const usuario = await Usuario.findOne({ email: req.usuario.email });
    const { titular, cuenta, contrasena } = req.body;
    const coincide = await usuario.compararPassword(contrasena);
    const bancoEncontrado = await Usuario.find({ cuentaBancariaIBAN: cuenta });

    if (!coincide) {
        return resp.json({ msg: "Password incorrecta" });
    } else if (bancoEncontrado.length > 0 && cuenta !== usuario.cuentaBancariaIBAN && cuenta) {
        return resp.json({ msg: "Cuenta en uso" });
    } else {
        let datos = {
            cuentaBancariaIBAN: cuenta,
            titular
        }

        if (contrasena) {
            datos.password = bcryptjs.hashSync(contrasena, 10);
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(String(usuario._id), datos, { new: true });

        return resp.json({
            msg: "IBAN actualizado con éxito",
            tokenActualizado: Token.getJwtToken(usuarioActualizado)
        });
    }
});

router.put("/sumar-bono/:idReferido", async(req, resp) => {
    const { idReferido } = req.params;
    const usuario = await Usuario.findById(idReferido);
    const bonos = usuario.bonos + 1;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(String(usuario._id), { $set: { bonos } }, { new: true });

    return resp.json({
        msg: "Bonos sumados",
        usuarioActualizado
    });
});



router.put("/recuperar-password", async(req, resp) => {

    const { email } = req.body;
    let usuario = await Usuario.findOne({ email });

    const nuevaPassword = crypto.randomBytes(5).toString("hex");

    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "comfystreamcontact@gmail.com",
            pass: "Grupo2ispp."
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: "comfystreamcontact@gmail.com",
        to: email,
        subject: "Recuperar contraseña de usuario de ComfyStream",
        html: `<p>
        ¡Muy buenas! Tu nueva contraseña es: <strong>${nuevaPassword}</strong>. Inicia sesión con ella y cámbiala por una personal.
        </p>`
    };

    transporter.sendMail(mailOptions, async function(error, info) {
        if (error) {
            return resp.json({ msg: error.message });
        } else {
            const password = bcryptjs.hashSync(nuevaPassword, 10);
            await Usuario.findByIdAndUpdate(String(usuario._id), { $set: { password } }, { new: true });
            return resp.json({
                msg: "Nueva password obtenida",
                nuevaPassword
            });
        }
    });
})

module.exports = router;