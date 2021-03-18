const jwt = require('jsonwebtoken')

class Token{
    static seed = "mi-seed-secreto-para-el-sistema"
    static caducidad = "30d"

    static getJwtToken(usuario){
        return jwt.sign({usuario}, this.seed, {expiresIn:this.caducidad})
    }

    static compararToken(token){
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.seed, (err, decoded) => {
                if(err) reject()
                else resolve(decoded)
            })
        })
    }

}


module.exports = Token