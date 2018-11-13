const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

const app = express();

// Opciones de FileUpload
app.use(fileUpload());

const borrarImagen = (tipo, nombreArchivo) => {
    let imagePath = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

const cambiarImagenUsuario = async(id, nombreArchivo) => {
    let usuarioDB = await Usuario.findById(id)
        .catch((err) => {
            throw Error(err);
        });
    let imagenAnterior = usuarioDB.img;
    usuarioDB.img = nombreArchivo;
    let nuevoUsuario = usuarioDB.save()
        .catch((err) => {
            throw Error(err);
        });
    borrarImagen('usuarios', imagenAnterior);
    return nuevoUsuario;
};

const cambiarImagenProducto = async(id, nombreArchivo) => {
    let productoDB = await Producto.findById(id)
        .catch((err) => {
            throw Error(err);
        });
    let imagenAnterior = productoDB.img;
    productoDB.img = nombreArchivo;
    let nuevoProducto = productoDB.save()
        .catch((err) => {
            throw Error(err);
        });
    borrarImagen('productos', imagenAnterior);
    return nuevoProducto;
};

app.put('/upload/:tipo/:id', async(req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;
    let tiposValidos = ['usuarios', 'productos'];
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se seleccionó ningún archivo.'
            }
        });
    }
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Las tipos válidos son: ${tiposValidos.join(', ')}`
            }
        });
    }
    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.');
    let ext = nombreArchivo[nombreArchivo.length - 1];
    let extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(ext) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `Las extensiones válidas son: ${extensionesValidas.join(', ')}`
            }
        })
    }
    let nuevoNombreArchivo = `${id}-${new Date().getMilliseconds()}.${ext}`;
    let nuevoUsuario;
    if (tipo === 'usuarios') {
        nuevoUsuario = await cambiarImagenUsuario(id, nuevoNombreArchivo)
            .catch((err) => {
                return res.status(400).json({
                    ok: false,
                    err
                });
            });
    } else {
        nuevoProducto = await cambiarImagenProducto(id, nuevoNombreArchivo)
            .catch((err) => {
                return res.status(400).json({
                    ok: false,
                    err
                });
            });
    }
    if (nuevoUsuario || nuevoProducto) {
        archivo.mv(`./uploads/${tipo}/${nuevoNombreArchivo}`, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                message: 'Archivo cargado exitosamente.',
                imagen: nuevoNombreArchivo
            })
        })
    }
});





// app.put('/upload/:tipo/:id', (req, res) => {
//     let tipo = req.params.tipo;
//     let id = req.params.id;
//     if (!req.files) {
//         return res.status(400).json({
//             ok: false,
//             err: {
//                 message: 'Ningun archivo seleccionado'
//             }
//         });
//     }
//     // Validar tipo
//     let tiposValidos = ['productos', 'usuarios'];
//     if (tiposValidos.indexOf(tipo) < 0) {
//         return res.status(400).json({
//             ok: false,
//             err: {
//                 message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
//             }
//         });
//     }

//     let archivo = req.files.archivo;
//     let nombreArchivo = archivo.name.split('.');
//     let extension = nombreArchivo[nombreArchivo.length - 1];

//     // Extensiones permitidas
//     let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
//     if (extensionesValidas.indexOf(extension) < 0) {
//         return res.status(400).json({
//             ok: false,
//             err: {
//                 message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
//                 ext: extension
//             }
//         })
//     }
//     // Cambiar nombre al archivo
//     let nombreDeArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
//     archivo.mv(`uploads/${tipo}/${nombreDeArchivo}`, (err) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 err
//             });
//         }
//         // Aqui la imagen ya se cargo al servidor
//         imagenUsuario(id, res, nombreDeArchivo);
//     });
// });

// function imagenUsuario(id, res, nombreDeArchivo) {
//     Usuario.findById(id, (err, usuarioDB) => {
//         if (err) {
//             return res.status(500).json({
//                 ok: false,
//                 err
//             });
//         }
//         if (!usuarioDB) {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no existe'
//                 }
//             });
//         }
//         let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
//         if (fs.existsSync(pathImagen)) {
//             fs.unlinkSync(pathImagen);
//         }
//         usuarioDB.img = nombreDeArchivo;
//         usuarioDB.save((err, usuarioGuardado) => {
//             res.json({
//                 ok: true,
//                 usuario: usuarioGuardado,
//                 img: nombreDeArchivo
//             })
//         })
//     });
// }

module.exports = app;