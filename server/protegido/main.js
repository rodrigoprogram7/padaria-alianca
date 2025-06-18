/*========== Configurações do menu==========*/

const nav = document.querySelector('#header nav')
const toggle = document.querySelectorAll('nav .toggle')

for (const element of toggle) {
    element.addEventListener('click', function() {
        nav.classList.toggle('show')
    })
}

/*========== Ao clicar em um dos ícones, fechar o menu ========== */

const links = document.querySelectorAll('nav ul li a')

for (const link of links) {
    link.addEventListener('click', function() {
        nav.classList.remove('show')
    })
}

/*========== Ao rolar o scroll, exibir a sombra no header da página ========== */

const header = document.querySelector("#header")
const navHeight = header.offsetHeight

window.addEventListener('scroll', function() {
    if (window.scrollY >= navHeight) {
        header.classList.add('scroll')
    }
    else {
        header.classList.remove('scroll')
    }
})


/*========== Scroll Reveal - animação de mostrar os elementos quando der scroll na página ========== */

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
    footer .brand, footer .social
    `, 
    { interval: 100 }
)

/*========== Menu ativo de acordo com a seção visível ========== */

const sections = document.querySelectorAll('main section[id]')

function ActivateMenuAtCurrentSection() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const link = document.querySelector(`nav a[href="#${sectionId}"]`);

    if (link) {
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

window.addEventListener('scroll', ActivateMenuAtCurrentSection);

/*========== Botão que quando pressionado, voltar para o topo ========== */

const backToTopButton = document.querySelector('.back-to-top');

backToTopButton.addEventListener('click', function (e) {
  e.preventDefault();
  document.querySelector('#carrinho').scrollIntoView({ behavior: 'smooth' });
});

window.addEventListener('scroll', function () {
  if (window.scrollY >= 560) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');

  }
  ActivateMenuAtCurrentSection();
});

function filtrarCategoria(categoriaSelecionada) {
  // Atualiza a aparência dos botões
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
  const categoriaMap = {
  alimentos: 0,
  padaria: 1,
  cestas: 2,
  bebidas: 3,
  frios: 4,
  limpeza: 5

};
document.querySelectorAll('.filtro-btn')[categoriaMap[categoriaSelecionada]].classList.add('active');


  // Mostra apenas os produtos da categoria selecionada
  const produtos = document.querySelectorAll('.produto');
  produtos.forEach(produto => {
    const categoria = produto.getAttribute('data-categoria');
    produto.style.display = categoria === categoriaSelecionada ? 'flex' : 'none';
  });
}

// Ativar filtro padrão ao carregar
window.onload = () => {
  atualizarCarrinho();
  filtrarCategoria('alimentos'); // Mostra apenas os produtos de alimentos
}

  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};

  function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  function alterarQuantidade(botao, delta) {
  const produtoEl = botao.closest('.produto');
  const input = produtoEl.querySelector('.quantidade');
  let valor = parseInt(input.value) + delta;

  const tipo = produtoEl.getAttribute('data-tipo') || 'unidade';

  // Define mínimo (100g para peso, 1 para unidade)
  if (tipo === 'peso') {
    valor = Math.max(100, valor); // mínimo 100g
  } else {
    valor = Math.max(1, valor);
  }

  input.value = valor;

  // Subtotal
  const preco = parseFloat(produtoEl.getAttribute('data-preco'));
  const subtotalEl = produtoEl.querySelector('.subtotal-preview');
    if (subtotalEl) {
    if ((tipo === 'peso' && valor > 100) || (tipo === 'unidade' && valor > 1)) {
      let subtotal = 0;
      if (tipo === 'peso') {
        subtotal = preco * (valor / 100);
        subtotalEl.textContent = `Subtotal: R$ ${subtotal.toFixed(2)} (${valor.toLocaleString('pt-BR')}g)`;
      } else {
        subtotal = preco * valor;
        subtotalEl.textContent = `Subtotal: R$ ${subtotal.toFixed(2)}`;
      }
      subtotalEl.style.color = 'green';
      subtotalEl.style.fontWeight = 'bold';
      subtotalEl.style.marginTop = '5px';
    } else {
      subtotalEl.textContent = '';
    }
  }

}

  function adicionarAoCarrinho(botao) {
  const produtoEl = botao.closest('.produto');
  const nome = produtoEl.querySelector('h3').textContent;
  const preco = parseFloat(produtoEl.getAttribute('data-preco'));
  const tipo = produtoEl.getAttribute('data-tipo') || 'unidade'; // padrão: unidade
  // Esconde o subtotal após adicionar
    const subtotalEl = produtoEl.querySelector('.subtotal-preview');
    if (subtotalEl) subtotalEl.textContent = '';


  const quantidadeInput = produtoEl.querySelector('.quantidade');
  let quantidade = parseInt(quantidadeInput.value);
  const imagem = produtoEl.querySelector('img')?.src;

  // Inicializa o carrinho com imagem e tipo
  if (carrinho[nome]) {
    carrinho[nome].quantidade += quantidade;
  } else {
    carrinho[nome] = {
      preco,
      quantidade,
      imagem,
      tipo
    };
  }

  // Atualiza carrinho
  salvarCarrinho();
  atualizarCarrinho();
  mostrarAlerta(nome, quantidade);

  // Resetar campo para 1 (unidade) ou 100 (peso)
  if (tipo === 'peso') {
    quantidadeInput.value = 100;
  } else {
    quantidadeInput.value = 1;
  }

  const input = produtoEl.querySelector('.quantidade');
if (input) {
  input.value = 1;
  input.dispatchEvent(new Event('input')); // força atualização visual
}
}

  function removerDoCarrinho(nome) {
    delete carrinho[nome];
    salvarCarrinho();
    atualizarCarrinho();
  }

  function aumentarQuantidade(nome) {
  const item = carrinho[nome];
  const tipo = item.tipo || 'unidade';

  if (tipo === 'peso') {
    item.quantidade += 100; // aumenta 100g
  } else {
    item.quantidade += 1; // aumenta 1 unidade
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function diminuirQuantidade(nome) {
  const item = carrinho[nome];
  const tipo = item.tipo || 'unidade';

  if (tipo === 'peso') {
    if (item.quantidade > 100) {
      item.quantidade -= 100;
    }
  } else {
    if (item.quantidade > 1) {
      item.quantidade -= 1;
    }
  }

  salvarCarrinho();
  atualizarCarrinho();
}

  function atualizarCarrinho() {
  const container = document.getElementById('itens-carrinho');
  container.innerHTML = '';
  let total = 0;

  for (const nome in carrinho) {
    const item = carrinho[nome];
        let subtotal = 0;
    if (item.tipo === 'peso') {
      subtotal = item.preco * (item.quantidade / 100);
    } else {
      subtotal = item.preco * item.quantidade;
    }

    total += subtotal;

    const div = document.createElement('div');
    div.classList.add('carrinho-item');

    div.innerHTML = `
  <div class="carrinho-nome">
    <img src="${item.imagem}" alt="${nome}" class="carrinho-miniatura">
    <span>${nome}</span>
  </div>

  <div class="carrinho-quantidade">
    <button class="btt" onclick="diminuirQuantidade('${nome}')">−</button>
    <span>${
      item.tipo === 'peso'
        ? item.quantidade.toLocaleString('pt-BR') + 'g'
        : item.quantidade
    }</span>
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
`;


    container.appendChild(div);
  }

  document.getElementById('total').textContent = total.toFixed(2);
}

  function enviarWhatsApp() {
  const erroEl = document.getElementById('erro-pedido');
  let total = 0;
  let mensagem = "*Olá! Esse é o meu pedido para entrega:*\n\n";

  for (const nome in carrinho) {
    const item = carrinho[nome];

    let subtotal = 0;
    if (item.tipo === 'peso') {
      subtotal = item.preco * (item.quantidade / 100); // ✅ corrige valor
      mensagem += `• ${item.quantidade}g de ${nome} - R$ ${subtotal.toFixed(2)}\n`;
    } else {
      subtotal = item.preco * item.quantidade;
      mensagem += `${item.quantidade}x ${nome} - R$ ${subtotal.toFixed(2)}\n`;
    }

    total += subtotal;
  }

  if (total < 20) {
    erroEl.textContent = "O valor mínimo para pedido é R$ 20,00.";
    erroEl.classList.add("show");
    erroEl.classList.remove("tremer");
    void erroEl.offsetWidth; // força reflow
    erroEl.classList.add("tremer");
    return;
  }

  erroEl.classList.remove("show");
  erroEl.textContent = "";

  mensagem += `\n*Total: R$ ${total.toFixed(2)}*`;

  const link = `https://wa.me/558488692337?text=${encodeURIComponent(mensagem)}`;
  window.open(link, '_blank');
}


   function mostrarAlerta(nomeProduto, quantidade) {
  const alerta = document.getElementById("alerta");
  alerta.innerHTML = `<strong style="display:inline-block; border-bottom: 1px solid currentColor;">${quantidade}x ${nomeProduto}</strong> adicionado ao carrinho!`;
  alerta.style.opacity = 1;
  alerta.style.transform = "translateY(0)";
  setTimeout(() => {
    alerta.style.opacity = 0;
    alerta.style.transform = "translateY(-20px)";
  }, 2000);
}

  atualizarCarrinho();

  const slide = document.getElementById('carouselSlide');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let index = 0;
    let interval;

    function updateCarousel() {
      slide.style.transform = `translateX(${-index * 100}%)`;
    }

    function nextSlide() {
      index = (index + 1) % items.length;
      updateCarousel();
    }

    function prevSlide() {
      index = (index - 1 + items.length) % items.length;
      updateCarousel();
    }

    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    function startAutoplay() {
      interval = setInterval(nextSlide, 5000); // Muda a cada 5 segundos
    }

    function resetAutoplay() {
      clearInterval(interval);
      startAutoplay();
    }

    // Inicia o autoplay ao carregar a página
    startAutoplay();



  document.querySelectorAll('.produto.carrossel').forEach(produto => {
  const variacoes = JSON.parse(produto.getAttribute('data-variacoes'));
  const imgGrande = produto.querySelector('.imagem-grande-wrapper img');
  const nomeProduto = produto.querySelector('h3');
  const precoProduto = produto.querySelector('p');
  const thumbsContainer = produto.querySelector('.carousel-thumbs');

  let current = 0;

  const updateProduto = () => {
    imgGrande.src = variacoes[current].img;
    nomeProduto.textContent = variacoes[current].nome;
    precoProduto.textContent = `R$ ${variacoes[current].preco.toFixed(2)}`;
    produto.setAttribute('data-nome', variacoes[current].nome);
    produto.setAttribute('data-preco', variacoes[current].preco);

    thumbsContainer.querySelectorAll('img').forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === current);
    });
  };

  // 🔥 Cria as miniaturas dinamicamente
  thumbsContainer.innerHTML = '';
  variacoes.forEach((item, index) => {
    const thumb = document.createElement('img');
    thumb.src = item.img;
    if (index === current) thumb.classList.add('active');
    thumb.addEventListener('click', () => {
      current = index;
      updateProduto();
    });
    thumbsContainer.appendChild(thumb);
  });

  // 🔄 Botões de navegação
  produto.querySelector('.carousel-prev').addEventListener('click', () => {
    current = (current - 1 + variacoes.length) % variacoes.length;
    updateProduto();
  });

  produto.querySelector('.carousel-next').addEventListener('click', () => {
    current = (current + 1) % variacoes.length;
    updateProduto();
  });

  updateProduto();
});




document.querySelectorAll('.produto.carrossel').forEach(produto => {
  const variacoes = JSON.parse(produto.getAttribute('data-variacoes'));
  const imgGrande = produto.querySelector('.imagem-grande-wrapper img');
  const nomeProduto = produto.querySelector('h3');
  const precoProduto = produto.querySelector('p');
  const thumbsContainer = produto.querySelector('.carousel-thumbs');

  let current = 0;

  const updateProduto = () => {
    imgGrande.src = variacoes[current].img;
    nomeProduto.textContent = variacoes[current].nome;
    precoProduto.textContent = `R$ ${variacoes[current].preco.toFixed(2)}`;
    produto.setAttribute('data-nome', variacoes[current].nome);
    produto.setAttribute('data-preco', variacoes[current].preco);

    thumbsContainer.querySelectorAll('img').forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === current);
    });
  };

  // Cria miniaturas
  thumbsContainer.innerHTML = '';
  variacoes.forEach((item, index) => {
    const thumb = document.createElement('img');
    thumb.src = item.img;
    if (index === current) thumb.classList.add('active');
    thumb.addEventListener('click', () => {
      current = index;
      updateProduto();
    });
    thumbsContainer.appendChild(thumb);
  });

  // Navegação pelas setas
  produto.querySelector('.prev-btn').addEventListener('click', () => {
    current = (current - 1 + variacoes.length) % variacoes.length;
    updateProduto();
  });

  produto.querySelector('.next-btn').addEventListener('click', () => {
    current = (current + 1) % variacoes.length;
    updateProduto();
  });

  updateProduto();
});



const navElement = document.querySelector('nav');
const openBtn = document.querySelector('.icon-menu');
const closeBtn = document.querySelector('.icon-close');
const menuLinks = document.querySelectorAll('.menu a');

openBtn.addEventListener('click', () => {
  nav.classList.add('show'); // usa sua lógica existente
});

closeBtn.addEventListener('click', () => {
  nav.classList.remove('show');
});

// Fecha o menu ao clicar em qualquer link
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('show');
  });
});


const campoPesquisa = document.getElementById('pesquisa');
const listaResultados = document.getElementById('resultados-pesquisa');

campoPesquisa.addEventListener('input', () => {
  const termo = normalizar(campoPesquisa.value.trim());

  listaResultados.innerHTML = '';

  if (termo.length < 1) return;

  const produtos = document.querySelectorAll('.produto');

  produtos.forEach(produto => {
    const nomeOriginal = produto.querySelector('h3')?.textContent || '';
    const nome = normalizar(nomeOriginal);

    // 🔍 Mostrar apenas produtos que COMEÇAM com o termo digitado
    if (nome.startsWith(termo)) {
      const li = document.createElement('li');
      li.textContent = nomeOriginal;

      li.addEventListener('click', () => {
        const categoria = produto.getAttribute('data-categoria');

        // Simula clique no botão da categoria correspondente
        const botoes = document.querySelectorAll('[data-filtro]');
        botoes.forEach(btn => {
          if (btn.getAttribute('data-filtro') === categoria) {
            btn.click();
          }
        });

                setTimeout(() => {
          // Rola até o produto
          produto.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Aplica classe com efeito visual
          produto.classList.add('encontrado');

          // Remove o efeito após 2 segundos
          setTimeout(() => {
            produto.classList.remove('encontrado');
          }, 2000);
        }, 200);

        campoPesquisa.value = '';
        listaResultados.innerHTML = '';
      });

      listaResultados.appendChild(li);
    }
  });
});

// 🔠 Função que normaliza strings (remove acentos e converte para minúsculas)
function normalizar(texto) {
  return texto
    .normalize('NFD')              // separa acentos de letras
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase();               // converte para minúsculas
}

function alterarPeso(botao, delta) {
  const produtoEl = botao.closest('.produto');
  const input = produtoEl.querySelector('input.quantidade');
  let valor = parseInt(input.value) || 100;
  valor = Math.max(100, valor + delta);
  input.value = valor;

  const preco = parseFloat(produtoEl.getAttribute('data-preco'));
  const subtotalEl = produtoEl.querySelector('.subtotal-preview');

  if (subtotalEl) {
    const subtotal = preco * (valor / 100);
    subtotalEl.textContent = `Subtotal: R$ ${subtotal.toFixed(2)} (${valor.toLocaleString('pt-BR')}g)`;
    subtotalEl.style.color = 'green';
    subtotalEl.style.fontWeight = 'bold';
    subtotalEl.style.marginTop = '5px';
  }
}







