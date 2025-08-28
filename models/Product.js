const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nome: String,            // Para produto único
  preco: Number,           // Para produto único
  categoria: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    required: true
  },
  imagens: [String],       // Para produto único

  variacoes: {
    type: [
      {
        nome: String,
        preco: Number,
        imagem: String
      }
    ],
    default: undefined     // 🔥 Impede validação se for ausente
  }
});

module.exports = mongoose.model('Product', ProductSchema);
