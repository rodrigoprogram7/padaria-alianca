const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nome: String,
  preco: String,
  categoria: String,
  tipo: String,
  imagens: [String]  // ✅ agora é uma lista de imagens
});

module.exports = mongoose.model('Product', productSchema);
