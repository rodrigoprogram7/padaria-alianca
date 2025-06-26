const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  tipoCard: { type: String, enum: ['unico', 'variacoes'], default: 'unico' },

  // Para produto único
  nome: String,
  preco: Number,
  tipo: String,
  categoria: String,
  imagens: [String],

  // Para cards com múltiplos produtos
  variacoes: [
    {
      nome: String,
      preco: Number,
      img: String
    }
  ]
});

module.exports = mongoose.model('Product', ProductSchema);
