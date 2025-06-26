const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nome: String,            // Usado apenas quando for produto único
  preco: Number,           // Mesmo caso acima
  categoria: {             // Fixo para ambos os modos
    type: String,
    required: true
  },
  tipo: {                  // "unidade" ou "peso"
    type: String,
    required: true
  },
  imagens: [String],       // Para produto único (até 5 imagens)

  variacoes: [             // Para produtos com múltiplas variações
    {
      nome: { type: String, required: true },
      preco: { type: Number, required: true },
      imagem: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Product', ProductSchema);
