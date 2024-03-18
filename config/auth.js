const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

//Model de Usuaários
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

module.exports = function(passport) {

    passport.use(new LocalStrategy({usernameField: 'email', passwordField:"senha"}, (email, senha, done)=>{

        Usuario.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                return done(null, false, { message: "Essa conta não existe" })
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem)=>{

                if(batem){
                    
                    return done(null, usuario)

                }else{

                    return done (null, false, {message: "Senha incorreta, tente novamente"})

                }
            })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario._id)
    })
    
    passport.deserializeUser((id, done) => {
        Usuario.findById(id).lean().then((usuario) => {
            done(null, usuario)
        }).catch((err)=>{
            done(null,false,{message:'algo deu errado'})
        })
    })
}
    
