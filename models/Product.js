const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nome: String, // para produto único
  preco: Number,
  categoria: String,
  tipo: String,
  imagens: [String],

  variacoes: [
    {
      nome: String,
      preco: Number,
      imagem: String
    }
  ]
});

module.exports = mongoose.model('Product', ProductSchema);
