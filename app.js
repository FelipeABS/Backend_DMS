"use strict"

var express = require("express");
var bodyParser = require("body-parser")

var app = express();
/*Esto lo que hace es transformar en objetos json los datos que nos llegan por las peticiones http*/
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
/*Cargar Rutas*/
var rutaUsuarios = require("./rutas/usuarios.ruta.js")
var rutaDocumentos = require("./rutas/documentos.ruta.js")
/*Cabeceras HTTP*/
app.use((req, res, next)=>{
 res.header("Access-Control-Allow-Origin", "*");
 res.header("Access-Control-Allow-Headers", "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method");
 res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
 res.header("Allow", "GET, POST, PUT, DELETE");
 if (req.method === "OPTIONS") 
        res.send(200);
    else  next(); 
})
/*Rutas Bases*/
app.use("/dms",rutaUsuarios);
app.use("/dms",rutaDocumentos);
/*Exportacion*/
module.exports = app;