const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
require('dotenv').config();

const app = express();

// ✅ Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// ✅ Configuração do Multer (upload de imagem)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ Middleware
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

// ✅ Proteção de arquivos específicos
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

// ✅ Rota de pedido
app.use('/pedido', require('./server/routes/pedido'));

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

// ✅ Rotas de Produto
const Product = require('./models/Product');

// Buscar produtos
app.get('/produtos', async (req, res) => {
  try {
    const produtos = await Product.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Adicionar produto com imagem
// Novo app.post adaptado para unitário e variações
app.post('/produtos', upload.array('imagens', 5), async (req, res) => {
  const { tipoCard, nome, preco, tipo, categoria } = req.body;

  try {
    if (tipoCard === 'variacoes') {
      const variacoes = [];
      const count = parseInt(req.body.totalVariacoes || 0);

      for (let i = 0; i < count; i++) {
        variacoes.push({
          nome: req.body[`variacoes[${i}][nome]`],
          preco: req.body[`variacoes[${i}][preco]`],
          img: 'uploads/' + req.files[i].filename
        });
      }

      const produto = new Product({ tipoCard, categoria, variacoes });
      await produto.save();
      return res.status(201).json({ mensagem: 'Card com variações adicionado!' });

    } else {
      const imagens = req.files.map(file => 'uploads/' + file.filename);
      const produto = new Product({ tipoCard, nome, preco, tipo, categoria, imagens });
      await produto.save();
      return res.status(201).json({ mensagem: 'Produto único adicionado com sucesso!' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao adicionar produto' });
  }
});




// ✅ Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
