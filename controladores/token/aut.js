"use strict"

var token = require("jwt-simple");
var momento = require("moment")
var claveSecreta = "chiguayante"

exports.autenticacion = function (req, res, next){
	//PAsamos el token por cabezera de autentificacion
	if(!req.headers.authorization){
		return res.status(403).send({mensaje: "La peticion no trae la autenticacion"})
	}else {
		//Quitar las comillas simple y dobles al token
		var tokenEnviado = req.headers.authorization.replace(/['""]+/g,'')
		//setencia de manejo de excepciones
		try {
			var cargarToken = token.decode(tokenEnviado, claveSecreta);
			//Comparamos la fecha actual con la del token
			if(cargarToken.exp <= momento().unix()){
				return res.status(403).send({mensaje: "El token a expirado"})
			}else {
			req.usuarioToken = cargarToken;
		    var Trestante = ((cargarToken.exp - momento().unix())/60)
		    var cargarTiempo = 10 - Trestante
		    cargarToken.exp = cargarToken.exp + (cargarTiempo*60)
			}
		}catch(excepcion){
           console.log(excepcion)
           return res.status(403).send({mensaje:"El Token no es valido"})
		}		
		req.usuarioTokenNuevo = token.encode(cargarToken, claveSecreta);
		next();
	}
}