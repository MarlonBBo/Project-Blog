const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {eAdmin}= require ('../helpers/eAdmin');


//Página principal
router.get('/', eAdmin, (req, res)=>{
    res.render("admin/index.handlebars");
});

//Carregador da pág. addcategorias
router.get('/categorias/add', eAdmin,(req, res)=>{
    res.render('admin/addcategorias');
});

//Válidação e criação da categoria
router.post('/categorias/nova', eAdmin,(req, res)=>{

    let erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"});
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }
    if (req.body.nome.length < 2){
        erros.push({texto: "Nome muito pequeno"});
    }
    if (erros.length > 0){
        res.render("admin/addcategorias", {erros: erros});
        
    }else{
        const novaCategoria = ({
            name: req.body.nome,
            slug: req.body.slug
        })
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err)=>{
            req.flash("error_msg", "Houv um erro ao criar categoria, tente novamente");
            res.redirect("/admin");
        })
    }
});

//Válidação da edição da categoria 
router.all("/categorias/edit/:id", eAdmin, (req, res)=>{

    Categoria.findOne({_id: req.params.id}).then((categoria)=>{

        const categoria2 = {
            _id: categoria._id, 
            slug: categoria.slug, 
            name: categoria.name
        }

        let erros = []

            if(req.method == 'GET'){
                res.render('admin/editcategorias', {categoria: categoria2});
                return
            }
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "slug inválido"});
        }
        if(req.body.nome.length < 2){
            erros.push({texto: "Nome muito pequeno"});
        }
        if(erros.length > 0){
            res.render("admin/editcategorias", {erros, categoria: categoria2});
            
        }
        else{

        categoria.name = req.body.nome,
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", "Categoria editada com sucesso");
            res.redirect("/admin/categorias");
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno ao editar a categoria");
            res.redirect("/admin/categorias");
        })
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houva um erro interno ao salvar a categoria");
        res.redirect("/admin/categorias");
    })
});

//Delete da categoria
router.post('/categorias/delete', eAdmin,(req, res)=>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso");
        res.redirect('/admin/categorias');
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao deletar a categoria");
        res.redirect("/admin/categorias");
    })
});

//Listando as categorias
router.get('/categorias', eAdmin,(req, res)=>{
    Categoria.find().lean().sort({date: 'desc'}).then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao criar categoria, tente novamente");
        res.redirect("/admin");
    })
});

//Carregador da pág. addpostagem e inserir a categoria na postagem
router.get("/postagens/add",eAdmin, (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao criar postagem");
    })
});

//Validação da criação da postagem
router.post("/postagens/nova",eAdmin, (req, res)=>{

    let erros = []   
   
       if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
           erros.push({texto: "Título inválido"});
       }
       if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
           erros.push({texto: "Slug inválido"});
       }
       if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
           erros.push({texto: "Descrição inválida"});
       }
       if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
           erros.push({texto: "Conteúdo inválido"});
       }
       if(req.body.categoria == 0){
           erros.push({texto: "categoria inválida"});
       }
       if(erros.length > 0){
           res.render("admin/addpostagem", {erros});
       }else{
           const novaPostagem = {
               titulo: req.body.titulo,
               slug: req.body.slug,
               descricao: req.body.descricao,
               conteudo: req.body.conteudo,
               categoria: req.body.categoria,
               
           }
           new Postagem(novaPostagem).save().then(()=>{
               req.flash("success_msg", "Postagem criada com sucesso");
               res.redirect("/admin/postagens");
           }).catch((err)=>{
               req.flash("error_msg", "Houve um erro ao salvar a postagem");
               res.redirect("/admin/postagens");
           })
       }
   });

//Válidação da edição da postagens
   router.all("/postagens/edit/:id",eAdmin,(req, res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagens)=>{
        
        const postagens2 = {

            _id: postagens.id,
            titulo: postagens.titulo,
            slug: postagens.slug,
            descricao: postagens.descricao,
            conteudo: postagens.conteudo,
            categoria: postagens.categoria
        }

        let erros = []


        if(req.method == 'GET'){
            Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {postagens: postagens2, categorias});
            });
            return

        }
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Título inválido"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"});
        }
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            erros.push({texto: "Descrição inválida"});
        }
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "Conteúdo inválido"});
        }
        if(req.body.categoria == 0){
            erros.push({texto: "categoria inválida"});
        }
        if(erros.length > 0){
            Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {erros, postagens: postagens2, categorias});
        })
        }else{
            
            postagens.titulo = req.body.titulo,
            postagens.slug = req.body.slug,
            postagens.descricao = req.body.descricao,
            postagens.conteudo = req.body.conteudo,
            postagens.categoria = req.body.categoria

            postagens.save().then(()=>{
                req.flash("success_msg", "Postagem editada com sucesso");
                res.redirect("/admin/postagens");
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro ao editar postagem");
                res.redirect("/admin/postagens");
            })
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno ao editar postagem");
        res.redirect("/admin/postagens");
    })
});

//Deletando postagem
router.post("/postagens/delete/:id", eAdmin,(req, res)=>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Postagem deletada com sucesso");
        res.redirect('/admin/postagens');
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao deletar a postagem");
        res.redirect("/admin/postagens");
    })
});


//Listando as postagens
router.get("/postagens", eAdmin,(req, res)=>{
    Postagem.find().lean().populate("categoria").sort({ date: 'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens});
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao listar os posts");
        res.redirect("/admin");
    })
});

module.exports = router;