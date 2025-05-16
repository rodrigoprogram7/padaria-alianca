const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const carrinho = req.body;
  let total = 0;
  let mensagem = "*Pedido da Padaria Aliança:*\n\n";

  for (const nome in carrinho) {
    const item = carrinho[nome];
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    mensagem += `${item.quantidade}x ${nome} - R$ ${subtotal.toFixed(2)}\n`;
  }

  if (total < 20) {
    return res.status(400).send('Pedido abaixo do mínimo de R$ 20,00.');
  }

  mensagem += `\n*Total: R$ ${total.toFixed(2)}*`;

  const numero = process.env.WHATSAPP_NUMERO;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  res.json({ url });
});

module.exports = router;
