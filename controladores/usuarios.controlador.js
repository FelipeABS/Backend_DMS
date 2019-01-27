"use strict"


  /*importamos el modelo de las cuentas*/
  var Cuentas = require("../modelos/cuentas.modelo.js");
  /*importamos el modelos de usuarios*/
  var Usuarios = require("../modelos/usuarios.modelo.js");
  /*Importamos la dependecia de bcrypt-nodejs*/
  var bcrypt = require("bcrypt-nodejs")
  //Importamos el Token
  var token = require("../token/token.js")

  var momento = require("moment")

  var mongoose = require('mongoose');

  var fs = require("fs")

  var path = require("path")
  //Actualizar Tabla grupos Agregando

  //parametros a recibir: usuario,password,tipo,nombre,apellidos,rut,fecha de nacimiento,Cesfam,sector,grupos,avisos

  /*Metodo para crear usuarios*/
  //Igual es necesario que se envie de autentificacion para crear usuarios
  function crearUsuario(req, res) {
      //Una Variable que traiga el objeto del modelo usuario
      var cuentas = new Cuentas();
      // Recibimos las variables 
      var parametros = req.body;
      //Asignamos el usuario
      cuentas.usuario = parametros.usuario;
      //Se confirma que no exista el mismo usuario
      Cuentas.find({ usuario: parametros.usuario }, (error, cuentaExistente) => {
          if (cuentaExistente.length > 0) {
              res.status(500).send({ cuentaExistente, mensaje: "Usuario ya existe" })
          } else {
            //Se confirmar que no exista el mismo rut
              Usuarios.find({ Rut: parametros.Rut }, (error, UsuarioExistente) => {
                  if (UsuarioExistente.length > 0) {
                      res.status(500).send({ UsuarioExistente, mensaje:"Rut ya existe" })
                  } else {
                      //Se confirma que la password no venga vacia
                      if (parametros.password) {
                          //Se usa funcion de bcrypt para encriptar password
                          bcrypt.hash(parametros.password, null, null, function(error, hash) {
                              //se asigna password
                              cuentas.password = hash;
                              cuentas.tipo = parametros.tipo;
                              if (cuentas.usuario != null) {

                                  /*Para guardar en la Base de datos*/

                                  cuentas.save((error, cuentaGuardado) => {
                                      if (error) {
                                          res.status(500).send({ message: "Error al guardar la cuenta" })
                                      } else {
                                          /*Se Rellenan los datos del usuario*/
                                          var usuarios = new Usuarios();
                                          usuarios.cuentaID = cuentas._id;
                                          usuarios.Nombre = parametros.Nombre;
                                          usuarios.Apellido_Paterno = parametros.Apellido_Paterno;
                                          usuarios.Apellido_Materno = parametros.Apellido_Materno;
                                          usuarios.Rut = parametros.Rut;
                                          usuarios.Cesfam = parametros.Cesfam;
                                          usuarios.Sector = parametros.Sector;
                                          usuarios.grupos = [];
                                          usuarios.avisos = [];
                                          usuarios.imagenPerfilRuta = "./ficheros/uploads/profile-pictures/perfil-defecto.png";
                                          /*Se Guardan los datos del usuario*/
                                          usuarios.save((error, usuarioGuardado) => {
                                              if (error) {
                                                  cuentas.findByIdAndRemove(cuentaGuardado._id, (error, cuentaBorrado) => {
                                                      if (error) {
                                                          res.status(500).send({ mensaje: "Error al borrar la cuenta" })
                                                      } else {
                                                          if (!cuentaBorrado) {
                                                              res.status(404).send({ mensaje: "No se ha podido borrar lacuenta" })
                                                          } else {
                                                              res.status(200).send({})
                                                          }
                                                      }
                                                  })
                                                  res.status(500).send({ mensaje: "Error al guardar el usuarios" })
                                              } else {
                                                  res.status(200).send({ token: req.usuarioTokenNuevo, usuarioGuardado })
                                              }
                                          })
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

  function comprobarToken(req, res) {
      if (req.usuarioToken.exp <= momento().unix()) {
          return res.status(403).send({ estadoToken: false })
      } else {
          return res.status(200).send({ token: req.usuarioTokenNuevo, estadoToken: true })
      }
  }

  function mostrarUsuarios(req, res) {
     Usuarios.find({}).populate('cuentaID').exec(function(error, mostrandoUsuarios) { 
          if (error) {
              res.status(500).send({ mensaje: "Error en la peticion" })
          } else {
              res.status(200).send({ token: req.usuarioTokenNuevo, mostrandoUsuarios })
          }
      })
  }

  function mostrarUsuario(req, res) {
      var id = req.usuarioToken.sub
      Usuarios.find({_id: id}, (error, mostrandoUsuario) => {
          if (error) {
              res.status(500).send({ mensaje: "Error en la peticion" })
          } else if(!mostrandoUsuario) {
              console.log(mostrandoUsuario)
              res.status(500).send({ mostrandoUsuario })
          }else{
            res.status(200).send({ token: req.usuarioTokenNuevo, mostrandoUsuario })
          }
      })
  }

  function mostrarNombre(req, res) {
      var id = req.params.id
      Usuarios.find({_id: id},{ "Nombre": 1, "_id": 0, "Apellido_Paterno":1,"Apellido_Materno":1 }, (error, mostrandoUsuario) => {
          if (error) {
              res.status(500).send({ mensaje: "Error en la peticion" })
          } else if(!mostrandoUsuario) {
              res.status(500).send({ mostrandoUsuario })
          }else{
            res.status(200).send({ token: req.usuarioTokenNuevo, mostrandoUsuario })
          }
      })
  }

  function mostrarGrupoUsuario(req, res) {
      var id = req.usuarioToken.sub
      Usuarios.find({ _id: id }, { "grupos": 1, "_id": 0 }, (error, mostrandoGrupo) => {
          if (error) {
              res.status(500).send({ mensaje: "Error en la peticion" })
          } else {
              res.status(200).send({ token: req.usuarioTokenNuevo, mostrandoGrupo })
          }
      })
  }
  /*LOGIN*/
  //Meotodo de ingreso de usuario (LOGIN)
  function ingresoUsuario(req, res) {
      //console.log(req.body);
      var parametros = req.body;
      Cuentas.find({ usuario: parametros.usuario }, (error, seleccionCuenta) => {
          if (error) {
              res.status(500).send({ mensaje: "Error al ingresar el usuario" })
          } else {
              if (!parametros.usuario || seleccionCuenta.length <= 0) {
                  res.status(404).send({ mensaje: "El usuario no existe" })
              } else {
                  bcrypt.compare(parametros.password, seleccionCuenta[0].password, function(error, ok) {
                      if (ok) {
                          if (parametros.token) {
                              //Devolvemos un token de jwt-simple
                              Usuarios.findOne({cuentaID: seleccionCuenta[0]._id}).populate('cuentaID').exec(function(err, infoUsuario) {
                                  if (err) {
                                      res.status(500).send({ mensaje: "No Existe Usuario asociado a la cuenta" })
                                  } else {
                                      if (!infoUsuario) {
                                          res.status(500).send({ mensaje: "Cuenta sin informacion", infoUsuario })
                                      } else {
                                          res.status(200).send({ token: token.crearToken(infoUsuario), infoUsuario })
                                      }
                                  }
                              })
                          }else{
                            res.status(500).send({ mensaje: "No Solicita token" })
                          }
                      } else {
                          res.status(400).send({ mensaje: "Contraseña Incorrecta" })
                      }
                  })
              }
          }
      })
  }
  //metodo para borrar usuarios
  //Metodo que requiere que la persona que fue logeada solo puede borrarse asi misma
  function borrarUsuario(req, res) {
      var id = req.params.id;
      Usuarios.find({ _id: id }, (error, usuarioSeleccionado) => {
          if (usuarioSeleccionado.length > 0) {
              Cuentas.findByIdAndRemove(usuarioSeleccionado[0].cuentaID, (err, cuentaBorrada) => {
                  if (error) {
                      res.status(500).send({ Mensaje: "Error" })
                  } else {
                      Usuarios.findByIdAndRemove(id, (error, usuarioBorrado) => {
                          if (!usuarioBorrado) {
                              res.status(500).send({ Mensaje: "Error" })
                          } else {
                              res.status(200).send({ cuentaBorrada, usuarioBorrado })
                          }
                      })
                  }
              })
          }
      })
  }

  function cambiarPassAdmin(req, res) {
      var id = req.params.id;
      var newpass = req.body.newpass;
      var password = req.body.password;
      if (password == newpass && password != null) {
          bcrypt.hash(newpass, null, null, function(error, hash) {
              //se asigna password
              password = hash;
              //Se actualiza la contraseña
              Cuentas.findByIdAndUpdate(id, { password: password }, (err, resp) => {
                  if (err) {
                      res.status(500).send({ mensaje: "Error al cambiar contraseña" })
                  } else {
                      if (!resp) {
                          res.status(404).send({ mensaje: "No se ah podido actualizar contraseña" })
                      } else {
                          console.log(newpass + '' + resp)
                          res.status(200).send({ token: req.usuarioTokenNuevo, resp })
                      }
                  }
              })
          })
      } else {
          res.status(500).send({ mensaje: "Las contraseñas no coinciden" })
      }
  }

  function cambiarPass(req, res) {
      //se reciben los parametros
      var id = req.params.id;
      var oldpass = req.body.oldpass;
      var password = req.body.password;
      var newpass = req.body.newpass;
      //Se comparan las contraseñas nuevas y que no venga vacia
      if (password == newpass && password != null) {
          //se busca usuario en la Bd
          Cuentas.findOne({ _id: id }, (err, cuentas) => {
              //Si ocurre error se envia el error
              if (err) {
                  res.status(500).send({ mensaje: "Error al obtener cuenta" })
              } else {
                  //En caso que se encuentre se compara las contraseñas
                  bcrypt.compare(oldpass, cuentas.password, function(error, ok) {
                      if (ok) {
                          //En caso de estar correctas se encripta la nueva contraseña
                          bcrypt.hash(newpass, null, null, function(error, hash) {
                              //se asigna password
                              cuentas.password = hash;
                              //Se actualiza la contraseña
                              Cuentas.findByIdAndUpdate(id, cuentas, (err, resp) => {
                                  if (err) {
                                      res.status(500).send({ mensaje: "Error al cambiar contraseña" })
                                  } else {
                                      if (!resp) {
                                          res.status(404).send({ mensaje: "No se ah podido actualizar contraseña" })
                                      } else {
                                          res.status(200).send({ token: req.usuarioTokenNuevo, resp })
                                      }
                                  }
                              })
                          })
                      } else {
                          res.status(404).send({ mensaje: "Contraseña Actual Incorrecta" })
                      }
                  })
              }
          })
      } else {
          res.status(404).send({ mensaje: "Contraseñas no coinciden" })
      }

  }

  function CrearAcualizarBorrarGrupoUsuario(req, res) {
      var id = req.usuarioToken.sub;
      var actualizar = req.body;
      Usuarios.find({ _id: id }, { "grupos": 1, "_id": 0 }, (error, mostrandoGrupo) => {
          if (error) {
              res.status(500).send({ mensaje: "Error en la peticion" })
          } else {
              console.log(mostrandoGrupo);
          }
      })
      Usuarios.findByIdAndUpdate(id, actualizar, (error, grupoActualizado) => {
          if (error) {
              res.status(500).send({ mensaje: "Error al crear grupo" })
          } else {
              if (!grupoActualizado) {
                  res.status(404).send({ mensaje: "No se ha podido crear grupo" })
              } else {
                  res.status(200).send({ token: req.usuarioTokenNuevo, grupoActualizado })
              }
          }
      })
  }

  function mostrarCuentas(req, res) {
      Cuentas.find((error, mostrandoCuentas) => {
          if (error) {
              res.status(500).send({ mensaje: "Error en la peticion" })
          } else {
              res.status(200).send({ token: req.usuarioTokenNuevo, mostrandoCuentas })
          }
      }).sort("_id");
  }

  function actualizarCuentas(req, res) {
      var id = req.params.id;
      var actualizarParametros = req.body;
      //Se actualiza la contraseña
      let cambio = {
        usuario : actualizarParametros.usuario,
        tipo : actualizarParametros.tipo
      }
      Cuentas.findByIdAndUpdate(id,cambio , (err, resp) => {
          if (err) {
              res.status(404).send({ mensaje: "Error al actualizar" })
          } else {
              if (!resp) {
                console.log(resp)
                  res.status(404).send({ mensaje: "No se ah podido actualizar la cuenta" })
              } else {
                  res.status(200).send({ token: req.usuarioTokenNuevo, resp })
              }
          }
      })
  }

  function borrarCuenta(req, res) {
      var id = req.params.id;
      Cuentas.findByIdAndRemove(id, (error, usuarioBorrado) => {
          if (error) {
              res.status(500).send({ mensaje: "Error al borrar la cuenta" })
          } else {
              if (!usuarioBorrado) {
                  res.status(404).send({ mensaje: "No se ha podido borrar la cuenta" })
              } else {
                  Usuarios.remove({ cuentaID: id }, (error, usuarioBorrado) => {
                      if (error) {
                          res.status(500).send({ mensaje: "Error al borrar el usuario" })
                      } else {
                          if (!usuarioBorrado) {
                              res.status(404).send({ mensaje: "No se ha podido borrar el usuario" })
                          } else {
                              res.status(200).send({ token: req.usuarioTokenNuevo, usuarioBorrado })
                          }
                      }
                  })

              }
          }
      })
  }

  function actualizarUsuario(req, res) {
      var id = req.params.id;
      var parametros = req.body;
      let actualizar = {
        Nombre: parametros.Nombre,
        Apellido_Paterno: parametros.Apellido_Paterno,
        Apellido_Materno: parametros.Apellido_Materno,
        Rut: parametros.Rut,
        Cesfam: parametros.Cesfam,
        Sector: parametros.Sector,
        grupos: parametros.grupos,
        avisos: parametros.avisos,
        imagenPerfilRuta: parametros.imagenPerfilRuta
      }
      Usuarios.findByIdAndUpdate(id, actualizar, (error, usuarioActualizado) => {
          if (error) {
              console.log(error)
              res.status(500).send({ mensaje: "Error al actualizar el usuario" })
          } else {
              console.log(usuarioActualizado)
              if (!usuarioActualizado) {
                  res.status(404).send({ mensaje: "No se ha podido actualizar el usuario" })
              } else {
                  res.status(200).send({ token: req.usuarioTokenNuevo, usuarioActualizado })
              }
          }
      })
  }

  function actualizarPerfilUsuario(req, res) {
      var actualizar = req.body;
      Usuarios.findByIdAndUpdate(req.usuarioToken.sub, actualizar, (error, usuarioActualizado) => {
          if (error) {
              console.log(error)
              res.status(500).send({ mensaje: "Error al actualizar el usuario" })
          } else {
              if (!usuarioActualizado) {
                  res.status(404).send({ mensaje: "No se ha podido actualizar el usuario" })
              } else {
                  res.status(200).send({ token: req.usuarioTokenNuevo, usuarioActualizado })
              }
          }
      })
  }

  function tomarFoto(req, res) {
      var foto = req.params.foto;
      var rutaArchivo = "./ficheros/uploads/profile-pictures/" + foto;
      var rutaFotodefecto = "./ficheros/uploads/profile-pictures/perfil-defecto.png"
      fs.exists(rutaArchivo, function(exists) {
        if (exists) {
            res.status(200).sendFile(path.resolve(rutaArchivo)) 
        } else {
           res.status(200).sendFile(path.resolve(rutaFotodefecto)) 
        }
      })
  }


  function actualizarFotoPerfil(req, res) {
      if (req.files) {
          var Ruta = req.body.usuario;
          var splitRuta = Ruta.substr(-29)
          var idImagen = splitRuta.replace(/['"]+/g, '')
          if(idImagen != "perfil-defecto.png"){
            fs.exists("./ficheros/uploads/profile-pictures/" + idImagen, function(exists) {
              if (exists) {
                  fs.unlink("./ficheros/uploads/profile-pictures/" + idImagen, function(result) {
                      if (!result) {
                          console.log("Eliminada")
                      }
                  })
              } else {
                console.log("No existe ruta: " + "./ficheros/uploads/profile-pictures/" + idImagen)
              }
            })
          }
         
           var archivoRuta = req.files.archivo.path
           var extensionImagen = req.files.archivo.name.substr(-3)
           Ruta = "./ficheros/uploads/profile-pictures/"+ req.usuarioToken.sub + "." + extensionImagen
           fs.rename(archivoRuta, Ruta, (res, error) => {
               if (error) {
                   res.status(404).send({ mensaje: "No se ha podido actualizar la imagen" })
               }
           });
       }
       Usuarios.findByIdAndUpdate(req.usuarioToken.sub, { imagenPerfilRuta: Ruta }, (error, usuarioActualizado) => {
           if (error) {
               res.status(500).send({ mensaje: "Error al actualizar el usuario" })
           } else {
               if (!usuarioActualizado) {
                   res.status(404).send({ mensaje: "No se ha podido actualizar el usuario" })
               } else {
                   res.status(200).send({ token: req.usuarioTokenNuevo, usuarioActualizado })
               }
           }
       })
  }





  /*exportamos los metodos del modulo*/
  module.exports = {
      cambiarPass,
      borrarUsuario,
      actualizarUsuario,
      ingresoUsuario,
      crearUsuario,
      mostrarUsuarios,
      comprobarToken,
      mostrarGrupoUsuario,
      CrearAcualizarBorrarGrupoUsuario,
      actualizarCuentas,
      borrarCuenta,
      mostrarCuentas,
      mostrarUsuario,
      actualizarFotoPerfil,
      cambiarPassAdmin,
      actualizarPerfilUsuario,
      tomarFoto,
      mostrarNombre
  }