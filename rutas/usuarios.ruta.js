"use strict"

var express = require("express");

//Cargamos el modulos del controlador
var ControladorUsuarios = require("../controladores/usuarios.controlador.js");
//Crear ruta
var api = express.Router();

var multipart = require("connect-multiparty")

var md_aut = require("../token/aut.js")

var fotoPerfil = multipart({
	uploadDir: "./ficheros/uploads/profile-pictures"
})
//Creamos el metodo Get de la Ruta
//Ruta para login
api.post("/login", ControladorUsuarios.ingresoUsuario);

api.get("/obtener-cuentas", ControladorUsuarios.mostrarCuentas); 
/*Metodo Get para obtener a todos los usuarios*/
api.get("/obtener-usuarios", ControladorUsuarios.mostrarUsuarios);

api.get("/obtener-usuario", md_aut.autenticacion, ControladorUsuarios.mostrarUsuario);

api.get("/obtener-nombre/:id", md_aut.autenticacion, ControladorUsuarios.mostrarNombre);

api.get("/obtener-grupo-usuarios", md_aut.autenticacion, ControladorUsuarios.mostrarGrupoUsuario);

api.get("/confirmartoken", md_aut.autenticacion, ControladorUsuarios.comprobarToken);

api.put("/crear-actualizar-borrar-grupo", md_aut.autenticacion,  ControladorUsuarios.CrearAcualizarBorrarGrupoUsuario);
//Crear metodo post
api.post("/crear-usuario",  ControladorUsuarios.crearUsuario);
//Cambio Password
api.put("/cambiar-pass/:id", ControladorUsuarios.cambiarPass);

api.put("/cambiar-pass-admin/:id", md_aut.autenticacion, ControladorUsuarios.cambiarPassAdmin);
//Ruta de actualizacion del usuario
api.put("/actualizar-usuario/:id",ControladorUsuarios.actualizarUsuario)

api.put("/actualizar-perfil-usuario",md_aut.autenticacion,  ControladorUsuarios.actualizarPerfilUsuario)

api.put("/actualizar-fotoPerfil", [md_aut.autenticacion,fotoPerfil], ControladorUsuarios.actualizarFotoPerfil)

api.put("/actualizar-cuenta/:id",md_aut.autenticacion,  ControladorUsuarios.actualizarCuentas)
//Ruta para Borrar Usuario
api.delete("/borrar-usuario/:id",md_aut.autenticacion, ControladorUsuarios.borrarUsuario)

api.delete("/borrar-cuenta/:id",md_aut.autenticacion,  ControladorUsuarios.borrarCuenta)

api.get("/tomar-foto/:foto",ControladorUsuarios.tomarFoto)
//exportamos el modulo api
module.exports = api;