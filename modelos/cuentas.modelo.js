"use strict"
/*para la base de datos*/
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
/*Creamos el esquema con los atributos*/
var CuentasSchema = Schema({
    usuario: String,
    password: String,
    tipo: String
})

module.exports = mongoose.model("Cuentas", CuentasSchema);