require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// ✅ Conexão MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// ✅ Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Multer com Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'padaria/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    format: async () => 'webp',
    public_id: (req, file) => Date.now() + '-' + file.originalname.replace(/\.[^/.]+$/, '')
  }
});
const upload = multer({ storage });

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'segredo_super_seguro',
  resave: false,
  saveUninitialized: false
}));

// ✅ Proteção contra hotlinking
app.use((req, res, next) => {
  const referer = req.get('Referer');
  const host = req.get('Host');
  if (!referer || referer.includes(host)) return next();
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return res.status(403).send('Hotlinking não permitido.');
  }
  next();
});

// ✅ Rota de arquivos protegidos
const protegidoPath = path.join(__dirname, 'server', 'protegido');
function bloquearAcessoDireto(req, res, next) {
  const referer = req.get('Referer');
  const host = req.get('Host');
  if (!referer || referer.includes(host)) return next();
  return res.status(403).send('Acesso negado.');
}
app.get('/estilo.css', bloquearAcessoDireto, (req, res) => {
  res.sendFile(path.join(protegidoPath, 'style.css'));
});
app.get('/script.js', bloquearAcessoDireto, (req, res) => {
  res.sendFile(path.join(protegidoPath, 'main.js'));
});

// ✅ Login simples
const ADMIN_HASH = '$2b$10$zZK7IEWQe4QJKQu3kusT0ulIMG1W6Bziq1mNlq925LAbF9YMRNZCW';
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});
app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === 'tramalho250@gmail.com' && await bcrypt.compare(senha, ADMIN_HASH)) {
    req.session.logado = true;
    res.redirect('/admin/painel');
  } else {
    res.send('❌ Login inválido');
  }
});
function proteger(req, res, next) {
  if (req.session.logado) return next();
  res.redirect('/login');
}
app.get('/admin/painel', proteger, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'painel.html'));
});

// ✅ Modelo
const Product = require('./models/Product');

// ✅ Buscar produtos
app.get('/produtos', async (req, res) => {
  try {
    const produtos = await Product.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// ✅ Adicionar produtos
app.post('/produtos', upload.fields([
  { name: 'imagens', maxCount: 5 },
  { name: 'v_imagens', maxCount: 5 }
]), async (req, res) => {
  const { modo, nome, preco, categoria, tipo, v_nome, v_preco } = req.body;

  try {
    if (modo === 'unico') {
      const imagens = (req.files['imagens'] || []).map(file => file.path);
      const novo = new Product({ nome, preco, categoria, tipo, imagens });
      await novo.save();
      return res.status(201).json({ mensagem: 'Produto único adicionado com sucesso!' });

    } else if (modo === 'variacoes') {
      const nomes = Array.isArray(v_nome) ? v_nome : [v_nome];
      const precos = Array.isArray(v_preco) ? v_preco : [v_preco];
      const imagens = req.files['v_imagens'] || [];

      const variacoes = [];
      for (let i = 0; i < nomes.length; i++) {
        if (nomes[i] && precos[i] && imagens[i]) {
          variacoes.push({
            nome: nomes[i],
            preco: parseFloat(precos[i]),
            imagem: imagens[i].path
          });
        }
      }

      if (variacoes.length === 0) {
        return res.status(400).json({ mensagem: 'Nenhuma variação válida recebida.' });
      }

      const novo = new Product({ categoria, tipo, variacoes });
      await novo.save();
      return res.status(201).json({ mensagem: 'Produto com variações adicionado com sucesso!' });
    }

    res.status(400).json({ mensagem: 'Modo inválido.' });
  } catch (err) {
    console.error('Erro ao salvar produto:', err);
    res.status(500).json({ mensagem: 'Erro interno ao salvar produto.' });
  }
});

// ✅ Excluir produto
app.delete('/produtos/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ mensagem: 'Produto removido com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    res.status(500).json({ mensagem: 'Erro ao remover o produto.' });
  }
});

// ✅ Editar produto
app.put('/produtos/:id', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, preco } = req.body;
    const update = { nome, preco };
    if (req.file && req.file.path) {
      update.imagens = [req.file.path];
    }
    await Product.findByIdAndUpdate(req.params.id, update);
    res.json({ mensagem: 'Produto atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao editar produto:', err);
    res.status(500).json({ mensagem: 'Erro ao editar produto.' });
  }
});

// ✅ Inicializa servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
