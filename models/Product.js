const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nome: String,
  preco: String,
  categoria: String,      // ✅ nova propriedade
  tipo: String,           // ✅ "peso" ou "unidade"
  imagem: String          // caminho do arquivo da imagem
});

module.exports = mongoose.model('Product', productSchema);
