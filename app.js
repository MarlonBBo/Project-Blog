const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const admin = require('./routes/admin');
require("dotenv").config();
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require("./models/Postagem");
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuario');
const passport = require("passport");
require('./config/auth')(passport);

//Configurações
    //Sessão
    app.use(session({
        secret: "node",
        resave: true,
        saveUninitialized: true
    }));

    //Validação do usuário
    app.use(passport.initialize());
    app.use(passport.session());

    //flash

    app.use(flash());
    
    //Middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash("error");
        res.locals.user = req.user || null;
        next();
    })
    //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    //BodyParser
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    //Mongoose

    const dbsenha = process.env.DB_PASSWORD;
    const dbuser = process.env.DB_USER;

    mongoose.Promise = global.Promise;
    mongoose.connect(`mongodb+srv://${dbuser}:${dbsenha}@starwars.ee189ab.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
        console.log('Server conectado ao mongo');
    }).catch((err)=>{
        console.log("Houve um erro"+err);
    })

    //Public
    app.use(express.static(path.join(__dirname,"public")));

//Página principal do usuário
app.get('/', (req, res)=>{
    Postagem.find().lean().populate('categoria').sort({ date: 'desc'}).then((postagens)=>{
        res.render('index',{postagens});
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno na listagem de postagem");
        res.redirect("/404");
    })
});

//Postagem 
app.get('/postagem/:slug', (req, res)=>{
    Postagem.findOne({slug: req.params.slug}).then((postagens)=>{
        if(postagens){
            const Post = {
                titulo: postagens.titulo,
                conteudo: postagens.conteudo,
                date: postagens.date
            }
            res.render('postagem/index', Post);
        }else{
        req.flash("error_msg", "Essa postagem não existe");
        res.redirect('/');
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno ao salvar a postagem");
        res.redirect('/');
    })
});

//Lista de categorias
app.get('/categorias', (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('categorias/index', {categorias});
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/');
    })
});

//Lista de postagens com categoria especifica
app.get('/categorias/:slug', (req, res)=>{
    Categoria.findOne({slug: req.params.slug}).then((categoria)=> {

        if(categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                res.render('categorias/postagens', {categoria, postagens});
            }).catch((err)=>{
                req.flash('error_msg', 'Houve um erro ao listar as postagens');
                res.redirect('/');
            })
        }else{
        req.flash('error_msg', 'Houve um erro, essa categoria não existe!');
        res.redirect('/');
        }

    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao listar ao listar as postagens com essa categoria');
        res.redirect('/');
    })
});

//Página de erro
app.get('/404', (req, res)=>{
    res.send('ERRO 404!');
});

//Rotas
app.use('/admin', admin);
app.use('/usuarios', usuarios);



//Started server
const PORT = 3333;
app.listen(PORT, ()=>{
    console.log("Server started at port " + PORT);
});