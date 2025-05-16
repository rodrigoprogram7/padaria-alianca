const express = require('express');
const path = require('path');
require('dotenv').config(); // carrega variáveis do .env

const app = express();

// Middleware para bloquear hotlinking
app.use((req, res, next) => {
  const referer = req.get('Referer');
  const host = req.get('Host');

  // Permitir acesso direto ou se o referer for do mesmo domínio
  if (!referer || referer.includes(host)) {
    return next(); // ok
  }

  // Bloquear acesso se for hotlink
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return res.status(403).send('Hotlinking não permitido.');
  }

  next();
});

const protegidoPath = path.join(__dirname, 'server', 'protegido');

// Middleware para proteger arquivos CSS e JS
function bloquearAcessoDireto(req, res, next) {
  const referer = req.get('Referer');
  const host = req.get('Host');

  if (!referer || referer.includes(host)) {
    return next(); // Acesso permitido
  }

  return res.status(403).send('Acesso negado.');
}

// Rota protegida para o CSS
app.get('/estilo.css', bloquearAcessoDireto, (req, res) => {
  res.sendFile(path.join(protegidoPath, 'style.css'));
});

// Rota protegida para o JS
app.get('/script.js', bloquearAcessoDireto, (req, res) => {
  res.sendFile(path.join(protegidoPath, 'main.js'));
});


// Agora o conteúdo estático
app.use(express.static('public'));


// Middleware para entender JSON
app.use(express.json());

// Torna a pasta "public" acessível ao navegador
app.use(express.static('public'));

// Rota segura de pedido
app.use('/pedido', require('./server/routes/pedido'));

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
