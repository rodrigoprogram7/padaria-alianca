/*========== Configurações do menu ==========*/
const nav = document.querySelector('#header nav')
const toggle = document.querySelectorAll('nav .toggle')

for (const element of toggle) {
  element.addEventListener('click', function() {
    nav.classList.toggle('show')
  })
}

/*========== Ao clicar em um dos ícones, fechar o menu ==========*/
const links = document.querySelectorAll('nav ul li a')
for (const link of links) {
  link.addEventListener('click', function() {
    nav.classList.remove('show')
  })
}

/*========== Scroll no header com sombra ==========*/
const header = document.querySelector("#header")
const navHeight = header.offsetHeight

window.addEventListener('scroll', function() {
  if (window.scrollY >= navHeight) {
    header.classList.add('scroll')
  } else {
    header.classList.remove('scroll')
  }
})

/*========== Scroll Reveal ==========*/
const scrollReveal = ScrollReveal({
  origin: 'top',
  distance: '15px',
  duration: 500,
  reset: true
})

scrollReveal.reveal(
  `#home .image, #home .text, #about .title, #about .pp,
  #about .container, #about .carrinho,
  #carro .title, #carro .pp,
  #carro .carousel-container,
  #contact .text, #contact .links,
  footer .brand, footer .social`,
  { interval: 100 }
)

/*========== Menu ativo na rolagem ==========*/
function ActivateMenuAtCurrentSection() {
  const sections = document.querySelectorAll('section[id]')
  const scrollY = window.scrollY

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100
    const sectionHeight = section.offsetHeight
    const sectionId = section.getAttribute('id')
    const link = document.querySelector(`nav a[href="#${sectionId}"]`)

    if (link) {
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    }
  })
}
window.addEventListener('scroll', ActivateMenuAtCurrentSection)

/*========== Botão voltar ao topo ==========*/
const backToTopButton = document.querySelector('.back-to-top')
backToTopButton.addEventListener('click', function(e) {
  e.preventDefault()
  document.querySelector('#carrinho').scrollIntoView({ behavior: 'smooth' })
})
window.addEventListener('scroll', function() {
  if (window.scrollY >= 560) {
    backToTopButton.classList.add('show')
  } else {
    backToTopButton.classList.remove('show')
  }
  ActivateMenuAtCurrentSection()
})

/*========== Filtro de categorias ==========*/
function filtrarCategoria(categoriaSelecionada) {
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'))
  const categoriaMap = {
    alimentos: 0,
    padaria: 1,
    cestas: 2,
    bebidas: 3,
    frios: 4,
    limpeza: 5
  }
  document.querySelectorAll('.filtro-btn')[categoriaMap[categoriaSelecionada]].classList.add('active')

  const produtos = document.querySelectorAll('.produto')
  produtos.forEach(produto => {
    const categoria = produto.getAttribute('data-categoria')
    produto.style.display = categoria === categoriaSelecionada ? 'flex' : 'none'
  })
}

window.onload = () => {
  atualizarCarrinho()
  filtrarCategoria('alimentos')
}

/*========== Carrinho ==========*/
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || {}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho))
}

function alterarQuantidade(botao, delta) {
  const produtoEl = botao.closest('.produto')
  const input = produtoEl.querySelector('.quantidade')
  let valor = parseInt(input.value) + delta

  const tipo = produtoEl.getAttribute('data-tipo') || 'unidade'

  if (tipo === 'peso') {
    valor = Math.max(100, valor)
  } else {
    valor = Math.max(1, valor)
  }

  input.value = valor

  const preco = parseFloat(produtoEl.getAttribute('data-preco'))
  const subtotalEl = produtoEl.querySelector('.subtotal-preview')
  if (subtotalEl) {
    if ((tipo === 'peso' && valor > 100) || (tipo === 'unidade' && valor > 1)) {
      let subtotal = tipo === 'peso' ? preco * (valor / 100) : preco * valor
      subtotalEl.textContent = tipo === 'peso'
        ? `Subtotal: R$ ${subtotal.toFixed(2)} (${valor}g)`
        : `Subtotal: R$ ${subtotal.toFixed(2)}`
      subtotalEl.style.color = 'green'
      subtotalEl.style.fontWeight = 'bold'
      subtotalEl.style.marginTop = '5px'
    } else {
      subtotalEl.textContent = ''
    }
  }
}

function adicionarAoCarrinho(botao) {
  const produtoEl = botao.closest('.produto')
  const nome = produtoEl.querySelector('h3').textContent
  const preco = parseFloat(produtoEl.getAttribute('data-preco'))
  const tipo = produtoEl.getAttribute('data-tipo') || 'unidade'
  const quantidadeInput = produtoEl.querySelector('.quantidade')
  let quantidade = parseInt(quantidadeInput.value)
  const imagem = produtoEl.querySelector('img')?.src

  const subtotalEl = produtoEl.querySelector('.subtotal-preview')
  if (subtotalEl) subtotalEl.textContent = ''

  if (carrinho[nome]) {
    carrinho[nome].quantidade += quantidade
  } else {
    carrinho[nome] = {
      preco,
      quantidade,
      imagem,
      tipo
    }
  }

  salvarCarrinho()
  atualizarCarrinho()
  mostrarAlerta(nome, quantidade)

  quantidadeInput.value = tipo === 'peso' ? 100 : 1
}

function removerDoCarrinho(nome) {
  delete carrinho[nome]
  salvarCarrinho()
  atualizarCarrinho()
}

function aumentarQuantidade(nome) {
  const item = carrinho[nome]
  const tipo = item.tipo || 'unidade'
  item.quantidade += tipo === 'peso' ? 100 : 1
  salvarCarrinho()
  atualizarCarrinho()
}

function diminuirQuantidade(nome) {
  const item = carrinho[nome]
  const tipo = item.tipo || 'unidade'
  if ((tipo === 'peso' && item.quantidade > 100) || (tipo === 'unidade' && item.quantidade > 1)) {
    item.quantidade -= tipo === 'peso' ? 100 : 1
  }
  salvarCarrinho()
  atualizarCarrinho()
}

function atualizarCarrinho() {
  const container = document.getElementById('itens-carrinho')
  container.innerHTML = ''
  let total = 0

  for (const nome in carrinho) {
    const item = carrinho[nome]
    const subtotal = item.tipo === 'peso'
      ? item.preco * (item.quantidade / 100)
      : item.preco * item.quantidade
    total += subtotal

    const div = document.createElement('div')
    div.classList.add('carrinho-item')
    div.innerHTML = `
      <div class="carrinho-nome">
        <img src="${item.imagem}" alt="${nome}" class="carrinho-miniatura">
        <span>${nome}</span>
      </div>
      <div class="carrinho-quantidade">
        <button class="btt" onclick="diminuirQuantidade('${nome}')">−</button>
        <span>${item.tipo === 'peso' ? item.quantidade + 'g' : item.quantidade}</span>
        <button class="btt" onclick="aumentarQuantidade('${nome}')">+</button>
      </div>
      <center>
        <div class="carrinho-subtotal">R$ ${subtotal.toFixed(2)}</div>
      </center>
      <div class="carrinho-acoes">
        <button onclick="removerDoCarrinho('${nome}')">
          <img id="imgg" src="assets/images/sistema/excluir.png" alt="">
        </button>
      </div>
    `
    container.appendChild(div)
  }

  document.getElementById('total').textContent = total.toFixed(2)
}

function enviarWhatsApp() {
  const erroEl = document.getElementById('erro-pedido')
  let total = 0
  let mensagem = "*Olá! Esse é o meu pedido para entrega:*\n\n"

  for (const nome in carrinho) {
    const item = carrinho[nome]
    const subtotal = item.tipo === 'peso'
      ? item.preco * (item.quantidade / 100)
      : item.preco * item.quantidade
    mensagem += item.tipo === 'peso'
      ? `• ${item.quantidade}g de ${nome} - R$ ${subtotal.toFixed(2)}\n`
      : `${item.quantidade}x ${nome} - R$ ${subtotal.toFixed(2)}\n`
    total += subtotal
  }

  if (total < 20) {
    erroEl.textContent = "O valor mínimo para pedido é R$ 20,00."
    erroEl.classList.add("show")
    erroEl.classList.remove("tremer")
    void erroEl.offsetWidth
    erroEl.classList.add("tremer")
    return
  }

  erroEl.classList.remove("show")
  erroEl.textContent = ""

  mensagem += `\n*Total: R$ ${total.toFixed(2)}*`

  const link = `https://wa.me/558488692337?text=${encodeURIComponent(mensagem)}`
  window.open(link, '_blank')
}

function mostrarAlerta(nomeProduto, quantidade) {
  const alerta = document.getElementById("alerta")
  alerta.innerHTML = `<strong>${quantidade}x ${nomeProduto}</strong> adicionado ao carrinho!`
  alerta.style.opacity = 1
  alerta.style.transform = "translateY(0)"
  setTimeout(() => {
    alerta.style.opacity = 0
    alerta.style.transform = "translateY(-20px)"
  }, 2000)
}

/*========== Carrossel de Miniaturas ==========*/
/*========== Carrossel de Miniaturas ==========*/
document.querySelectorAll('.produto.carrossel').forEach(produto => {
  const variacoes = JSON.parse(produto.getAttribute('data-variacoes'))
  const imgGrande = produto.querySelector('.imagem-grande-wrapper img')
  const nomeProduto = produto.querySelector('h3')
  const precoProduto = produto.querySelector('p')
  const thumbsContainer = produto.querySelector('.carousel-thumbs')

  const prevBtn = produto.querySelector('.carousel-prev')
  const nextBtn = produto.querySelector('.carousel-next')

  let current = 0

  const thumbs = []

  // Criação das miniaturas
  if (thumbsContainer) {
    variacoes.forEach((variacao, index) => {
      const thumb = document.createElement('img')
      thumb.src = variacao.img
      thumb.alt = variacao.nome
      thumb.addEventListener('click', () => {
        current = index
        updateProduto()
      })
      thumbsContainer.appendChild(thumb)
      thumbs.push(thumb)
    })
  }

  const updateProduto = () => {
    imgGrande.src = variacoes[current].img
    nomeProduto.textContent = variacoes[current].nome
    precoProduto.textContent = `R$ ${variacoes[current].preco.toFixed(2)}`
    produto.setAttribute('data-nome', variacoes[current].nome)
    produto.setAttribute('data-preco', variacoes[current].preco)

    const inputQuantidade = produto.querySelector('.quantidade')
    const tipo = produto.getAttribute('data-tipo') || 'unidade'

    if (inputQuantidade) {
      inputQuantidade.value = tipo === 'peso' ? 100 : 1
    }

    const subtotalEl = produto.querySelector('.subtotal-preview')
    if (subtotalEl) subtotalEl.textContent = ''

    if (thumbs.length > 0) {
      thumbs.forEach((img, index) => {
        img.classList.toggle('ativo', index === current)
      })
    }
  }

  // Função das setas
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      current = (current - 1 + variacoes.length) % variacoes.length
      updateProduto()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % variacoes.length
      updateProduto()
    })
  }

  updateProduto()
})



