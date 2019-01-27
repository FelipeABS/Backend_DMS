"use strict"

var express = require("express");

//Cargamos el modulos del controlador
var ControladorDocumentos = require("../controladores/documentos.controlador.js");
//Crear ruta
var api = express.Router();

var multipart = require("connect-multiparty")

var fichero = multipart({
	//Ruta para subir imagenes
	uploadDir: "./ficheros/archivo"
})

var md_aut = require("../token/aut.js")
//Creamos el metodo Get de la Ruta
/*Metodo Get para obtener a todos los usuarios*/
api.get("/mostrar-documentos", md_aut.autenticacion, ControladorDocumentos.mostrarDocumentos);

api.post("/tipo-cuenta", ControladorDocumentos.probarCuenta);

api.get("/aceptar-documento/:id", md_aut.autenticacion, ControladorDocumentos.aceptarDocumento);

api.get("/rechazar-documento/:id", md_aut.autenticacion, ControladorDocumentos.rechazarDocumento);

api.get("/mostrar-todos-documentos", md_aut.autenticacion, ControladorDocumentos.mostrarTodosDocumentos);
//Crear metodo post
api.post("/crear-documento", [md_aut.autenticacion,fichero],ControladorDocumentos.crearDocumento);
//Ruta de actualizacion del usuario
api.put("/actualizar-documento/:id", [md_aut.autenticacion, fichero], ControladorDocumentos.actualizarDocumento)
//Ruta para Borrar Usuario
api.delete("/borrar-documento/:id", md_aut.autenticacion, ControladorDocumentos.borrarDocumento)
//
api.get("/tomar-archivo/:archivo",ControladorDocumentos.tomarArchivo)
//exportamos el modulo api
module.exports = api;