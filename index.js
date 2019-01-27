"use strict"

/* LibreariaMongoDB*/

var mongoose = require("mongoose");

/*Modulo express*/

var app = require("./app");
var port = process.env.PORT || 1501;

/* Conexion a Base de Datos*/
mongoose.connect("mongodb://localhost:27017/mongodb",(error, respuesta) => {
	if (error) {
	  throw error;
	} else {
		app.listen(port, function(){
			console.log("servidor del ApiRest en http://localhost:"+port)
		})
	}
})