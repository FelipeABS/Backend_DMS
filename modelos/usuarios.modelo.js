"use strict"
/*para la base de datos*/
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
/*Creamos el esquema con los atributos*/
var UsuariosSchema = Schema({
	cuentaID: { 
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Cuentas'
    },
	Nombre: String,
	Apellido_Paterno: String,
	Apellido_Materno: String,
	Rut: String,
	Cesfam: String,
	Sector: String,
	grupos: [],
	avisos: [],
	imagenPerfilRuta: String
})

module.exports = mongoose.model("Usuarios", UsuariosSchema,"usuarios");