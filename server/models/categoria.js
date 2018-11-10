const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let categoriasValidas = {
    message: '{VALUE} no es una categoria válida'
}

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'El nombre de la categoria es necesario']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true]
    }
});

categoriaSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser unica'
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', true);
mongoose.set('useCreateIndex', true);
module.exports = mongoose.model('Categoria', categoriaSchema);