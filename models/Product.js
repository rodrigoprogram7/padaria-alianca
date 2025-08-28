const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  categoria: { type: String, required: true },
  tipo: { type: String, required: true }, // unidade | peso | encomenda
  descricao: String,  // 🔹 usado apenas para "Encomenda"
  imagens: [String],
  variacoes: {
    type: [{ nome: String, preco: Number, imagem: String }],
    default: undefined
  }
});


module.exports = mongoose.model('Product', ProductSchema);
