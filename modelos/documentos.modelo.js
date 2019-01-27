"use strict"
/*para la base de datos*/
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
/*Creamos el esquema con los atributos*/
var DocumentosSchema = Schema({
	archivo: String,
	titulo: String,
	descripcion: String,
	destinatario: [],
 	grupoDestino: [],
	porConfirmar: [],
	confirmados: [],
	rechazados: [],
	fechaCreacion:Date,
 	creadorID:String

})

module.exports = mongoose.model("Documentos", DocumentosSchema);