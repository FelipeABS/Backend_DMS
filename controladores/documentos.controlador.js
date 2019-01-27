"use strict"

/*importamos el modelos de usuarios*/
var Documentos = require("../modelos/documentos.modelo.js");

var Usuarios = require("../modelos/usuarios.modelo.js");

var Cuentas = require("../modelos/cuentas.modelo.js");
//Importamos el Token
var token = require("../token/token.js")

var fs = require("fs")
var path = require("path")
var confirmar = 0;

function crearDocumento(req, res) {

    var documentos = new Documentos();
    //Recogemos los parametros que llegan por post
    var parametros = req.body;
    documentos.titulo = parametros.titulo;
    documentos.descripcion = parametros.descripcion;
    if (req.files) {

        var archivoRuta = req.files.archivo.path
        var archivoSplit = archivoRuta.substr(-28)
        documentos.archivo = archivoSplit;

        if (documentos.titulo != null && documentos.descripcion != null) {
            documentos.destinatario = JSON.parse(parametros.destinatario)
            documentos.grupoDestino = JSON.parse(parametros.grupoDestino)
            documentos.confirmarPendiente = parametros.confirmarPendiente
            documentos.porConfirmar = []
            documentos.confirmados = []
            documentos.rechazados = []
            documentos.fechaCreacion = parametros.fechaCreacion
            documentos.creadorID = parametros.creadorID
            documentos.save((error, archivoGuardado) => {
                if (error) {
                    res.status(500).send({ mensaje: "Error al guardar el archivo" })
                } else {
                    if (!archivoGuardado) {
                        res.status(404).send({ mensaje: "No se ha podido guardar el archivo" })
                    } else {
   
                        avisarUsuarios(documentos.destinatario, documentos.grupoDestino, archivoGuardado, req.usuarioToken.sub)
                        res.status(200).send({ token: req.usuarioTokenNuevo, archivoGuardado })
                    }
                }
            })

        }

    } else {
        res.status(404).send({ mensaje: "Debe adjuntar el archivo" })
    }

}

function avisarUsuarios(destinatario, grupo, documento, idusuario) {
    var usuariosId = destinatario
    var grupos = grupo
    var idUsuarios = []
    var id = idusuario
    var idlocal;
    Usuarios.find({ _id: id }, { "grupos": 1, "_id": 0, "avisos": 1 }, (error, mostrandoGrupo) => {
        if (error) {
            res.status(500).send({ mensaje: "Error en la peticion" })
        } else {
            for (var i = grupos.length - 1; i >= 0; i--) {
                for (var j = mostrandoGrupo[0].grupos.length - 1; j >= 0; j--) {
                    if (mostrandoGrupo[0].grupos[j].titulo == grupos[i].nombreGrupo) {
                        for (var z = mostrandoGrupo[0].grupos[j].usuarios.length - 1; z >= 0; z--) {
                            idUsuarios.push(mostrandoGrupo[0].grupos[j].usuarios[z].Iduser)
                        };
                    }
                };

            };
            for (var i = usuariosId.length - 1; i >= 0; i--) {
                if (idUsuarios.includes(usuariosId[i].usuarioID) == false) {
                    idUsuarios.push(usuariosId[i].usuarioID)
                }
            };
            //////////////////////////////
            //Se Avisara a cada usuario //
            //////////////////////////////
            for (var i = idUsuarios.length - 1; i >= 0; i--) {
                //id local de cada usuario que debe ser avisado
                idlocal = idUsuarios[i]
                let nuevouser = {
                    idUsuario: idUsuarios[i]
                }
                documento.porConfirmar.push(nuevouser)
                let infoAviso = {
                    idDocumento: documento._id
                }
                //se busca el grupo de avisos de cada usuario sincronicamente con una promesa
                avisarBD(idlocal, infoAviso,id).then(function() {})
                //fin for
            }
              Documentos.findByIdAndUpdate(documento._id,documento,(error,documentoActualizado) => {
              if(error){
                return false
              }else{
                return true
              }
            })
        }
    })
}
function avisarSecretaria(infoAviso){
    Cuentas.find({tipo: 'sec'},(error,Cuenta)=>{
        if(error){
            res.status(500).send({Cuenta})
        }else{
          Usuarios.find({ cuentaID: Cuenta[0]._id },(error, usuario) => {
            if (error) {
                return false
            } else {
                usuario[0].avisos.push(infoAviso)
                //se agrega el nuevo documento y se actualiza en la bd
                Usuarios.findByIdAndUpdate(usuario[0]._id, usuario[0], (error, usuarioActualizado) => {
                    if (error) {
                        return false
                    } else {
                        if (!usuarioActualizado) {
                            return false
                        } else {
                            let nuevouser = {
                              idUsuario: usuario[0]._id
                            }
                            Documentos.find({_id:infoAviso.idDocumento},(error,Documento)=>{
                                if(error){
                                    res.status(500).send({ mensaje: "No existe Documento" })
                                }else{                                                                    
                                    Documento[0].porConfirmar.push(nuevouser)
                                    Documentos.findByIdAndUpdate(Documento[0]._id,Documento[0],(error,DocumentoNuevo)=>{
                                        if(error){
                                            res.status(500).send({ mensaje: "Error al actualizar el Archivo" })
                                        }else{
                                            return true
                                        }
                                    })
                                }
                            }) 
                            
                        }
                    }
                })

            }
        })
        }
     })
}
function avisarSecretariaB(infoAviso){
    Cuentas.find({tipo: 'sec'},(error,Cuenta)=>{
        if(error){
            res.status(500).send({Cuenta})
        }else{
          Usuarios.find({ cuentaID: Cuenta[0]._id },(error, usuario) => {
            if (error) {
                return false
            } else {
                usuario[0].avisos.push(infoAviso)
                //se agrega el nuevo documento y se actualiza en la bd
                Usuarios.findByIdAndUpdate(usuario[0]._id, usuario[0], (error, usuarioActualizado) => {
                    if (error) {
                        return false
                    } else {
                        if (!usuarioActualizado) {
                            return false
                        } else {
                            return true
                        }
                    }
                })

            }
        })
        }
     })
}
function avisarJefaDas(infoAviso){
    console.log("sera avisada")
      Cuentas.find({tipo: 'admces'},(error,Cuenta)=>{
        if(error){
            res.status(500).send({Cuenta})
        }else{
          Usuarios.find({ cuentaID: Cuenta[0]._id },(error, usuario) => {
            if (error) {
                return false
            } else {
                usuario[0].avisos.push(infoAviso)
                console.log("Se agrego aviso")
                //se agrega el nuevo documento y se actualiza en la bd
                Usuarios.findByIdAndUpdate(usuario[0]._id, usuario[0], (error, usuarioActualizado) => {
                    if (error) {
                        return false
                    } else {
                        if (!usuarioActualizado) {
                            return false
                        } else {
                            console.log("jefedas avisado por secretaria")
                            return true                                     
                        }
                    }
                })

            }
        })
        }
     })
}
function avisarJefeSector(infoAviso){
    Cuentas.find({tipo: 'jsec'},(error,Cuenta)=>{
            if(error){
                res.status(500).send({Cuenta})
            }else{
              Usuarios.find({ cuentaID: Cuenta[0]._id },(error, usuario) => {
                if (error) {
                    return false
                } else {
                    usuario[0].avisos.push(infoAviso)
                    //se agrega el nuevo documento y se actualiza en la bd
                    Usuarios.findByIdAndUpdate(usuario[0]._id, usuario[0], (error, usuarioActualizado) => {
                        if (error) {
                            return false
                        } else {
                            if (!usuarioActualizado) {
                                return false
                            } else {
                                let nuevouser = {
                                  idUsuario: usuario[0]._id
                                }
                                Documentos.find({_id:infoAviso.idDocumento},(error,Documento)=>{
                                    if(error){
                                        res.status(500).send({ mensaje: "No existe Documento" })
                                    }else{                                                                    
                                        Documento[0].porConfirmar.push(nuevouser)
                                        Documentos.findByIdAndUpdate(Documento[0]._id,Documento[0],(error,DocumentoNuevo)=>{
                                            if(error){
                                                res.status(500).send({ mensaje: "Error al actualizar el Archivo" })
                                            }else{
                                                return true
                                            }
                                        })
                                    }
                                }) 
                                
                            }
                        }
                    })

                }
            })
            }
         })
        
}
function avisarJefeSectorB(infoAviso){
    Cuentas.find({tipo: 'jsec'},(error,Cuenta)=>{
            if(error){
                res.status(500).send({Cuenta})
            }else{
              Usuarios.find({ cuentaID: Cuenta[0]._id },(error, usuario) => {
                if (error) {
                    return false
                } else {
                    usuario[0].avisos.push(infoAviso)
                    //se agrega el nuevo documento y se actualiza en la bd
                    Usuarios.findByIdAndUpdate(usuario[0]._id, usuario[0], (error, usuarioActualizado) => {
                        if (error) {
                            return false
                        } else {
                            if (!usuarioActualizado) {
                                return false
                            } else {
                                return true
                            }
                        }
                    })

                }
            })
            }
         })
        
}
//idlocal -> Destino
//id -> Origen
//infoAviso
function avisarBD(idlocal, infoAviso,id) {
    const promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
            /*Analizar Jerarquia Para avisar*/
            var tipoCuentaOrigen;
            var tipoCuentaDestino;
            Usuarios.find({_id:id}).populate('cuentaID').exec(function(error, usuario) {
                console.log(usuario[0].cuentaID.tipo)
                tipoCuentaOrigen = usuario[0].cuentaID.tipo
                Usuarios.find({_id:idlocal}).populate('cuentaID').exec(function(error, usuario2) {
                tipoCuentaDestino = usuario2[0].cuentaID.tipo

                switch (tipoCuentaDestino){
                    case 'admces': if(tipoCuentaOrigen == 'jsec'){
                                   /*Confirmar Que la secretaria esta confirmada sino hace esta de abajo*/
                                     avisarSecretaria(infoAviso)
                                    }else if(tipoCuentaOrigen == 'sec'){
                                      avisarJefaDas(infoAviso)
                                    }else if(tipoCuentaOrigen == 'esp'){
                                        //Tip: Buscar Primero que esten Confirmados y luego que esten avisado
                                        /*Confirmar que jefe de sector no este avisado, en caso que exista confirmacion buscar a la secretaria*/
                                        /*Y Pushear el Aviso a esta*/
                                        /**/
                                        avisarJefeSector(infoAviso)
                                        }
                                    break
                    case 'sec' : if(tipoCuentaOrigen == 'esp'){
                                /*Cofirmar que no halla sido notificado por el mismo documento*/
                                 avisarJefeSector(infoAviso)
                                 }else{
                                   /*Confirmar Que la secretaria esta confirmada sino hace esta de abajo*/
                                 avisarSecretariaB(infoAviso)
                                 }
                                 break
                    case 'jsec' : avisarJefeSectorB(infoAviso)
                                  break
                    case 'esp' : Usuarios.find({ _id: idlocal },(error, usuario) => {
                                    if (error) {
                                        return false
                                    } else {
                                        usuario[0].avisos.push(infoAviso)
                                        //se agrega el nuevo documento y se actualiza en la bd
                                        Usuarios.findByIdAndUpdate(usuario[0]._id, usuario[0], (error, usuarioActualizado) => {
                                            if (error) {
                                                return false
                                            } else {
                                                if (!usuarioActualizado) {
                                                    return false
                                                } else {
                                                    resolve(true)     
                                                }
                                            }
                                        })

                                    }
                                })
                                break
                }

            })
            })
        }, 1000);
    })
    return promise
}

function desavisarUsuarios(destinatario, grupo, idDoc, idusuario) {
    var usuariosId = destinatario
    var grupos = grupo
    var idUsuarios = []
    var id = idusuario
    var idlocal;
    //Se requiero idusuario(id) para sacar los id de los usuarios de los grupos asociados al documento
    Usuarios.find({ _id: id }, { "grupos": 1, "_id": 0, "avisos": 1 }, (error, mostrandoGrupo) => {
        if (error) {
            res.status(500).send({ mensaje: "Error en la peticion" })
        } else {
            for (var i = grupos.length - 1; i >= 0; i--) {
                for (var j = mostrandoGrupo[0].grupos.length - 1; j >= 0; j--) {
                    if (mostrandoGrupo[0].grupos[j].titulo == grupos[i].nombreGrupo) {
                        for (var z = mostrandoGrupo[0].grupos[j].usuarios.length - 1; z >= 0; z--) {
                            idUsuarios.push(mostrandoGrupo[0].grupos[j].usuarios[z].Iduser)
                        };
                    }
                };

            };
            for (var i = usuariosId.length - 1; i >= 0; i--) {
                if (idUsuarios.includes(usuariosId[i].usuarioID) == false) {
                    idUsuarios.push(usuariosId[i].usuarioID)
                }
            };
            //////////////////////////////
            //Se desavisara a cada usuario //
            //////////////////////////////
            for (var i = idUsuarios.length - 1; i >= 0; i--) {
                //se crea nuevo documento
                idlocal = idUsuarios[i]

                //se busca el grupo de avisos de cada usuario sincronicamente con una promesa
                desavisarBD(idlocal, idDoc).then(function() {})
                //fin for
            }
        }
    })
}



function mostrarDocumentos(req, res) {
    Documentos.find({ creadorID: req.usuarioToken.sub }, (error, mostrandoDocumentos) => {
        if (error) {
            res.status(500).send({ mensaje: "Error en la peticion" })
        } else {
            res.status(200).send({ token: req.usuarioTokenNuevo, mostrandoDocumentos })
        }
    }).sort("_id");
}
function mostrarTodosDocumentos(req, res) {
    Documentos.find({}, (error, mostrandoDocumentos) => {
        if (error) {
            res.status(500).send({ mensaje: "Error en la peticion" })
        } else {
            res.status(200).send({ token: req.usuarioTokenNuevo, mostrandoDocumentos })
        }
    }).sort("_id");
}

//metodo para borrar usuarios
function borrarDocumento(req, res) {
    //se recibe id a borrar
    var id = req.params.id;
    //Se busca el archivo para borrarlo fisicamente de la bd
    Documentos.findOne({ _id: id }, (error, capturarArchivo) => {
        if (error) {
            //posible error de bd
            res.status(500).send({ mensaje: "Error al capturar el archivo" })
        } else {
            if (!capturarArchivo) {
                //El archivo vino vacio
                res.status(404).send({ mensaje: "No se ha podido capturar el archivo" })
            } else {
                //Se borra el arhivo
                var antiguoArchivo = capturarArchivo.archivo
                var rutaArchivo = "./ficheros/archivo/" + antiguoArchivo;
                fs.unlink(rutaArchivo)
            }
        }
    })
    // Se espera para que se borre fisicamente, y se borra en la bd
    setTimeout(function() {
        Documentos.findByIdAndRemove(id, (error, borrarArchivo) => {
            if (error) {
                res.status(500).send({ mensaje: "Error al capturar el archivo" })
            } else {
                if (!borrarArchivo) {
                    res.status(404).send({ mensaje: "No se ha podido borrar el Archivo" })
                } else {
                    desavisarUsuarios(borrarArchivo.destinatario, borrarArchivo.grupoDestino, borrarArchivo._id, req.usuarioToken.sub)
                    res.status(200).send({ token: req.usuarioTokenNuevo, borrarArchivo })
                }
            }
        })
    }, 1000)
}

function tomarArchivo(req, res) {

    var archivo = req.params.archivo;
    var rutaArchivo = "./ficheros/archivo/" + archivo;
    fs.exists(rutaArchivo, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(rutaArchivo))
        } else {
            res.status(404).send({ mensaje: "El Archivo no existe" })
        }
    })
}

function actualizarDocumento(req, res) {
    //Se crea objeto del modelo documentos
    var documentos = Documentos();
    //Se reciben los parametros
    var id = req.params.id;
    var parametros = req.body;
    documentos.titulo = parametros.titulo;
    documentos.descripcion = parametros.descripcion;
    var CambioArchivo = false;

    //Si es 0 significa que no quiere actualizar el archivo sino sus parametros
    if (parametros.actualizarArchivo == "0") {
        documentos.archivo = parametros.rutaArchivoActual;
        CambioArchivo = true;
    } else {
        if (req.files) {

            var ArchivoRuta = req.files.archivo.path
            var archivoSplit = ArchivoRuta.split("\\")
            documentos.archivo = archivoSplit[2];

            var antiguoArchivo = parametros.rutaArchivoActual;
            var rutaArchivo = "./ficheros/archivo/" + antiguoArchivo;
            fs.unlink(rutaArchivo);
        }
        CambioArchivo = true
    }

    if (CambioArchivo) {
        if (documentos.titulo != null && documentos.descripcion != null && documentos.archivo != null) {
            var actualizar = {
                "titulo": documentos.titulo,
                "descripcion": documentos.descripcion,
                "archivo": documentos.archivo,
                "destinatario": JSON.parse(parametros.destinatario),
                "grupoDestino": JSON.parse(parametros.grupoDestino),
                "confirmarPendiente": parametros.confirmarPendiente,
                "fechaCreacion": parametros.fechaCreacion,
                "creadorID": parametros.creadorID
            }
            Documentos.findByIdAndUpdate(id, actualizar, (error, archivoActualizado) => {
                if (error) {
                    res.status(500).send({ mensaje: "Error al actualizar el Archivo" })
                } else {
                    if (!archivoActualizado) {
                        res.status(404).send({ mensaje: "No se ha podido actualizar el Archivo" })
                    } else {
                        res.status(200).send({ token: req.usuarioTokenNuevo, archivoActualizado })
                    }
                }
            })
        }
    }
}
function desavisarBD(idlocal, idDoc) {
    const promise = new Promise(function(resolve, reject) {
        setTimeout(function() {
            Usuarios.find({ _id: idlocal }, { "_id": 0, "avisos": 1 }, (error, mostrandoGrupo) => {
                if (error) {
                    return false
                } else {
                    for (var i = mostrandoGrupo[0].avisos.length - 1; i >= 0; i--) {
                        if (JSON.stringify(idDoc) === JSON.stringify(mostrandoGrupo[0].avisos[i].idDocumento)) {
                            mostrandoGrupo[0].avisos.splice(i, 1)
                        }
                    };
                    Usuarios.findByIdAndUpdate(idlocal, mostrandoGrupo[0], (error, usuarioActualizado) => {
                        if (error) {
                            return false
                        } else {
                            if (!usuarioActualizado) {
                                return false
                            } else {
                                resolve(true)
                            }
                        }
                    })
                }
            })
        }, 10);
    })
    return promise
}

function aceptarDocumento(req, res){
    var documentos = Documentos();
    var idDocumento = req.params.id;
    var idSiguiente;
    var tipoActual;
    let user = {
      idConfirmado : req.usuarioToken.sub,
      fechaConfirmacion: new Date()
    }
    desavisarBD(req.usuarioToken.sub,idDocumento)
    Documentos.find({_id:idDocumento},(error,Documento)=>{
        if(error){
            res.status(500).send({ mensaje: "No existe Documento" })
        }else{
            for (var i = Documento[0].porConfirmar.length - 1; i >= 0; i--) {
                if (JSON.stringify(req.usuarioToken.sub) === JSON.stringify(Documento[0].porConfirmar[i].idUsuario)) {
                    Documento[0].porConfirmar.splice(i, 1)
                }
            };
            Documento[0].confirmados.push(user)
            Documentos.findByIdAndUpdate(idDocumento,Documento[0],(error,DocumentoNuevo)=>{
                if(error){
                    res.status(500).send({ mensaje: "Error al actualizar el Archivo" })
                }else{
                    Documentos.findOne({_id:idDocumento},(error,Documento)=>{
                        /*Recorrer Documento.destinatario -> preguntar si existe en Confirmados, sino AvisarBD*/
                        if(Documento.porConfirmar.length > 0  ){
                           Usuarios.find({_id:req.usuarioToken.sub}).populate('cuentaID').exec(function(error, usuario) {
                            tipoActual = usuario[0].cuentaID.tipo 
                            if(tipoActual != 'esp'){
                              for(var i=0;i<Documento.porConfirmar.length;i++){
                              idSiguiente = Documento.porConfirmar[i].idUsuario;
                               Usuarios.find({_id:idSiguiente}).populate('cuentaID').exec(function(error, usuario) {
                                if(usuario[0].cuentaID.tipo != 'esp'){
                                  let infoAviso = {
                                  idDocumento: Documento._id
                                  }
                                switch(tipoActual){
                                    case 'sec': avisarJefaDas(infoAviso) 
                                                break;
                                    case 'jsec': avisarSecretaria(infoAviso)
                                }                                
                                }
                               })
                             }
                             res.status(200).send({usuario})    
                            }else res.status(200).send({DocumentoNuevo})
                           })                      
                        }else res.status(200).send({DocumentoNuevo})
                    })
                }
            })
        }
    }) 
}
function rechazarDocumento(req, res){
    var documentos = Documentos();
    //se obtiene id del documento
    var idDocumento = req.params.id;
    var idSiguiente;
    var tipoActual;
    //se crea el usuario a rechazar
    let user = {
      idRechazado : req.usuarioToken.sub,
      fechaRechazo: new Date()
    }
    //Se le desavisa el doc
    desavisarBD(req.usuarioToken.sub,idDocumento)
    //se busca el doc
    Documentos.find({_id:idDocumento},(error,Documento)=>{
        if(error){
            res.status(500).send({ mensaje: "No existe Documento" })
        }else{
            //Se busca al usuario en por confirmar
            for (var i = Documento[0].porConfirmar.length - 1; i >= 0; i--) {
                if (JSON.stringify(req.usuarioToken.sub) === JSON.stringify(Documento[0].porConfirmar[i].idUsuario)) {
                   //Se borra si se pilla
                    Documento[0].porConfirmar.splice(i, 1)
                }
            };
            //Se agrega nuevo rechazado
            Documento[0].rechazados.push(user)
            //Se actualiza el Documento
            Documentos.findByIdAndUpdate(idDocumento,Documento[0],(error,DocumentoNuevo)=>{
                if(error){
                    res.status(500).send({ mensaje: "Error al actualizar el Archivo" })
                }else{
                   res.status(200).send({DocumentoNuevo}) 
                }
            })
        }
    }) 
}

function tipoCuenta(id){
 Usuarios.find({_id:id}).populate('cuentaID').exec(function(error, posts) {
   if(error){
    console.log(error)
   }else{
    console.log(posts[0].cuentaID.tipo)
    return posts
   }
 })
}

function probarCuenta(req,res){
  var parametros = req.body
  var tipo = tipoCuenta(parametros.id)
  console.log(tipo)
  res.status(200).send({tipo})
}

/*exportamos los metodos del modulo*/
module.exports = {
    probarCuenta, 
    mostrarDocumentos,
    borrarDocumento,
    actualizarDocumento,
    crearDocumento,
    tomarArchivo,
    mostrarTodosDocumentos,
    aceptarDocumento,
    rechazarDocumento
}
