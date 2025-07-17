let produtos = [];

async function carregarProdutos() {
  try {
    const res = await fetch('/produtos');
    produtos = await res.json();
    renderizarProdutos(produtos);
    atualizarCarrinho();
    filtrarCategoria('mercearia');
  } catch (err) {
    console.error('Erro ao carregar produtos do servidor', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
});

const nav = document.querySelector('#header nav');
const toggle = document.querySelectorAll('nav .toggle');

for (const element of toggle) {
  element.addEventListener('click', function () {
    nav.classList.toggle('show');
  });
}



const links = document.querySelectorAll('nav ul li a');
for (const link of links) {
  link.addEventListener('click', function () {
    nav.classList.remove('show');
  });
}

function toggleHeaderScroll() {
  const header = document.querySelector('#header');
  const carrinho = document.querySelector('.carrinho');
  const categoria = document.getElementById('categoria-destaque');

  if (!header || !carrinho || !categoria) return;

  const scrollY = window.scrollY;
  const categoriaTop = categoria.offsetTop;
  const carrinhoTop = carrinho.offsetTop;

  const offsetAtivarNavbarGrande = 300; // ajuste para ativar antes ou depois da div

  if (scrollY < categoriaTop - offsetAtivarNavbarGrande) {
    header.classList.remove('scroll'); // navbar pequeno
  } else if (scrollY >= categoriaTop - offsetAtivarNavbarGrande && scrollY < carrinhoTop - 200) {
    header.classList.add('scroll'); // navbar grande
  } else if (scrollY >= carrinhoTop - 200) {
    header.classList.remove('scroll'); // navbar pequeno
  }
}


let jaDeslizouCategorias = false;
let estadoNavbar = 'pequeno'; // controla se está grande ou pequeno


function toggleHeaderScrollCategoria() {
  const header = document.querySelector('#header');
  const carrinho = document.querySelector('.carrinho');
  const categoria = document.getElementById('categoria-destaque');
  const categoriasBar = document.querySelector('.categorias-navbar');

  if (!header || !carrinho || !categoria || !categoriasBar) return;

  const scrollY = window.scrollY;
  const categoriaTop = categoria.offsetTop;
  const carrinhoTop = carrinho.offsetTop;

  const ativarGrande = categoriaTop - 80;
  const desativarGrande = categoriaTop - 120; // zona de histerese (menor que o ativar)

  if (scrollY >= ativarGrande && scrollY < carrinhoTop - 100) {
    if (estadoNavbar !== 'grande') {
      header.classList.add('scroll');
      estadoNavbar = 'grande';

      if (!jaDeslizouCategorias) {
        jaDeslizouCategorias = true;

        setTimeout(() => {
          categoriasBar.scrollTo({ left: categoriasBar.scrollWidth, behavior: 'smooth' });

          setTimeout(() => {
            categoriasBar.scrollTo({ left: 0, behavior: 'smooth' });
          }, 500);
        }, 300);
      }
    }

  } else if (scrollY < desativarGrande || scrollY >= carrinhoTop - 100) {
    if (estadoNavbar !== 'pequeno') {
      header.classList.remove('scroll');
      estadoNavbar = 'pequeno';
    }
  }
}





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

window.addEventListener('scroll', function () {
  toggleHeaderScrollCategoria(); // agora chamando a sua nova lógica
  ActivateMenuAtCurrentSection();
});


document.addEventListener('DOMContentLoaded', function () {
  const backToTopButton = document.querySelector('.back-to-top');
  const carrinho = document.getElementById('carrinho');
  if (backToTopButton && carrinho) {
    backToTopButton.addEventListener('click', function (e) {
      e.preventDefault();
      carrinho.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});

function renderizarProdutos(produtos) {
  const lista = document.getElementById('lista-produtos');
  lista.innerHTML = '';

    produtos.sort((a, b) => {
    const nomeA = (a.nome || a.variacoes?.[0]?.nome || '').toLowerCase();
    const nomeB = (b.nome || b.variacoes?.[0]?.nome || '').toLowerCase();
    return nomeA.localeCompare(nomeB);
  });

  produtos.forEach(prod => {
    if (prod.variacoes && prod.variacoes.length > 0) {
      lista.appendChild(renderizarCardComVariacoes(prod));
    } else {
      lista.appendChild(renderizarCardUnico(prod));
    }
  });

  inicializarCarrosseisManuais();
}



function renderizarCardUnico(prod) {
  const precoFormatado = parseFloat(prod.preco).toFixed(2).replace('.', ',');
  const imagem = prod.imagens?.[0] || '/assets/images/alimentos/sem-imagem.jpg';

  const card = document.createElement('div');
  card.className = 'produto';
  card.setAttribute('data-nome', prod.nome.toLowerCase());
  card.setAttribute('data-preco', prod.preco);
  card.setAttribute('data-categoria', prod.categoria);
  card.setAttribute('data-tipo', prod.tipo || 'unidade');

  card.innerHTML = `
    <img src="${imagem}" alt="${prod.nome}">
    <div class="produto-info">
      <h3>${prod.nome}</h3>
      <p>R$ ${precoFormatado}</p>
      <div class="quantidade-box">
        <button class="btt2" onclick="alterarQuantidade(this, -1)">−</button>
        <input type="number" min="1" value="1" class="quantidade">
        <button class="btt2" onclick="alterarQuantidade(this, 1)">+</button>
      </div>
      <div class="subtotal-preview"></div>
      <button id="bt" type="button" class="btn btn-primary" onclick="adicionarAoCarrinho(this)">Adicionar</button>
    </div>
  `;

  return card;
}

function renderizarCardComVariacoes(prod) {
  const primeira = prod.variacoes[0];
  const precoFormatado = parseFloat(primeira.preco).toFixed(2).replace('.', ',');

  const card = document.createElement('div');
  card.className = 'produto carrossel';
  card.setAttribute('data-categoria', prod.categoria);
  card.setAttribute('data-preco', primeira.preco);
  card.setAttribute('data-tipo', prod.tipo || 'unidade');
  card.setAttribute('data-variacoes', JSON.stringify(prod.variacoes));
  card.setAttribute('data-nome', primeira.nome);

  card.innerHTML = `
    <div class="produto-img-wrapper">
      <div class="imagem-grande-wrapper">
        <img src="${primeira.imagem}" alt="${primeira.nome}">
      </div>
      <button type="button" class="carousel-btn carousel-prev">❮</button>
      <button type="button" class="carousel-btn carousel-next">❯</button>
      <div class="carousel-thumbs">
       ${prod.variacoes.map(v => `<img src="${v.imagem}" alt="${v.nome}">`).join('')}
      </div>
    </div>
    <div class="produto-info">
      <h3>${primeira.nome}</h3>
      <p>R$ ${precoFormatado}</p>
      <div class="quantidade-box">
        <button class="btt2" onclick="alterarQuantidade(this, -1)">−</button>
        <input type="number" min="1" value="1" class="quantidade">
        <button class="btt2" onclick="alterarQuantidade(this, 1)">+</button>
      </div>
      <div class="subtotal-preview"></div>
      <button id="bt" type="button" class="btn btn-primary" onclick="adicionarAoCarrinho(this)">Adicionar</button>
    </div>
  `;

  return card;
}

function filtrarCategoria(categoriaSelecionada) {
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
  const botaoAtivo = document.querySelector(`.filtro-btn[data-categoria="${categoriaSelecionada}"]`);
  if (botaoAtivo) botaoAtivo.classList.add('active');

  const produtosFiltrados = categoriaSelecionada === 'todos'
    ? produtos
    : produtos.filter(prod => prod.categoria === categoriaSelecionada);

        produtos.sort((a, b) => {
    const nomeA = (a.nome || a.variacoes?.[0]?.nome || '').toLowerCase();
    const nomeB = (b.nome || b.variacoes?.[0]?.nome || '').toLowerCase();
    return nomeA.localeCompare(nomeB);
  });

  renderizarProdutos(produtosFiltrados);

const destinoCategoria = document.getElementById('categoria-destaque');
if (destinoCategoria) {
  const y = destinoCategoria.getBoundingClientRect().top + window.scrollY - 230; // ajuste do topo (70px de margem)
  window.scrollTo({ top: y, behavior: 'smooth' });
}

    const titulo = document.getElementById('titulo-categoria');
  if (titulo) {
    const categoriaNome = categoriaSelecionada.charAt(0).toUpperCase() + categoriaSelecionada.slice(1);
    titulo.textContent = categoriaNome;
}
}





const inputPesquisa = document.getElementById('pesquisa');
const resultadosPesquisa = document.getElementById('resultados-pesquisa');

if (inputPesquisa) {
  inputPesquisa.addEventListener('input', function () {
    const termo = inputPesquisa.value.toLowerCase();
    resultadosPesquisa.innerHTML = '';

    if (termo.length < 2) {
      resultadosPesquisa.style.display = 'none';
      return;
    }

    const encontrados = [];

    produtos.forEach(prod => {
      // Nome principal
      if (prod.nome?.toLowerCase().includes(termo)) {
        encontrados.push({
          nome: prod.nome,
          categoria: prod.categoria,
          variacao: null
        });
      }

      // Variações
      if (Array.isArray(prod.variacoes)) {
        prod.variacoes.forEach(v => {
          if (v.nome?.toLowerCase().includes(termo)) {
            encontrados.push({
              nome: v.nome,
              categoria: prod.categoria,
              variacao: v.nome,
              produtoOriginal: prod
            });
          }
        });
      }
    });

    if (encontrados.length > 0) {
      resultadosPesquisa.style.display = 'block';

      encontrados.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.nome;

        li.addEventListener('click', () => {
          inputPesquisa.value = '';
          resultadosPesquisa.style.display = 'none';

          const nomeBuscado = item.nome.toLowerCase();
          const categoria = item.categoria?.toLowerCase();

          filtrarCategoria(categoria);

          setTimeout(() => {
            const produtosDOM = document.querySelectorAll('.produto');

            const alvo = [...produtosDOM].find(el =>
              el.getAttribute('data-nome')?.toLowerCase() === nomeBuscado
            );

            if (alvo) {
              // Scroll para o card
              const y = alvo.getBoundingClientRect().top + window.scrollY - 250;
              window.scrollTo({ top: y, behavior: 'smooth' });

              alvo.classList.add('highlight');
              setTimeout(() => alvo.classList.remove('highlight'), 2000);

              // Se for carrossel, avançar para a variação correta
              if (alvo.classList.contains('carrossel') && item.variacao) {
                const variacoes = JSON.parse(alvo.getAttribute('data-variacoes') || '[]');
                const index = variacoes.findIndex(v => v.nome.toLowerCase() === item.variacao.toLowerCase());

                if (index >= 0) {
                  const btnNext = alvo.querySelector('.carousel-next');
                  let tentativas = 0;

                  // simula avanço de carrossel até o item desejado
                  const avançar = () => {
                    if (tentativas >= variacoes.length) return;
                    const nomeAtual = alvo.getAttribute('data-nome').toLowerCase();
                    if (nomeAtual === item.variacao.toLowerCase()) return;
                    btnNext?.click();
                    tentativas++;
                    setTimeout(avançar, 200);
                  };

                  avançar();
                }
              }
            }
          }, 400);
        });

        resultadosPesquisa.appendChild(li);
      });
    } else {
      resultadosPesquisa.style.display = 'none';
    }
  });
}














function inicializarCarrosseisManuais() {
  document.querySelectorAll('.produto.carrossel').forEach(produto => {
    const variacoes = JSON.parse(produto.getAttribute('data-variacoes'));
    const imgGrande = produto.querySelector('.imagem-grande-wrapper img');
    const nomeProduto = produto.querySelector('h3');
    const precoProduto = produto.querySelector('p');
    const thumbsContainer = produto.querySelector('.carousel-thumbs');
    const prevBtn = produto.querySelector('.carousel-prev');
    const nextBtn = produto.querySelector('.carousel-next');

    let current = 0;
    const thumbs = Array.from(thumbsContainer.children);

    function updateProduto() {
      const v = variacoes[current];
      imgGrande.src = v.imagem;
      nomeProduto.textContent = v.nome;
      precoProduto.textContent = `R$ ${parseFloat(v.preco).toFixed(2).replace('.', ',')}`;
      produto.setAttribute('data-nome', v.nome);
      produto.setAttribute('data-preco', v.preco);

      // Resetar quantidade
      const inputQuantidade = produto.querySelector('.quantidade');
      if (inputQuantidade) inputQuantidade.value = 1;

      // Esconder subtotal
      const subtotalBox = produto.querySelector('.subtotal-preview');
      if (subtotalBox) {
        subtotalBox.textContent = '';
        subtotalBox.style.display = 'none';
      }

      // Destacar miniatura e centralizar no scroll
thumbs.forEach((img, i) => {
  img.classList.toggle('ativo', i === current);

  if (i === current) {
    img.setAttribute('tabindex', '-1');
    img.blur();

    // SCROLL CORRIGIDO para o item visível
    const firstThumb = thumbs[0];
    const lastThumb = thumbs[thumbs.length - 1];

    if (img === firstThumb) {
      // Força scroll para o início do container
      thumbsContainer.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (img === lastThumb) {
      // Força scroll para o fim
      thumbsContainer.scrollTo({ left: thumbsContainer.scrollWidth, behavior: 'smooth' });
    } else {
      // Centraliza variação ativa
      const scrollOffset = img.offsetLeft - thumbsContainer.offsetWidth / 2 + img.offsetWidth / 2;
      thumbsContainer.scrollTo({ left: scrollOffset, behavior: 'smooth' });
    }
  }
});

    }

    // Bloqueia rolagem indesejada ao clicar nas setas
    prevBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      current = (current - 1 + variacoes.length) % variacoes.length;
      updateProduto();
    });

    nextBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      current = (current + 1) % variacoes.length;
      updateProduto();
    });

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        current = index;
        updateProduto();
      });
    });

    updateProduto();
  });
}


function selecionarProduto(nomeProduto) {
  const produto = document.querySelector(`.produto[data-nome="${nomeProduto.toLowerCase()}"]`);
  if (!produto) return;

  const categoria = produto.getAttribute('data-categoria');
  const categoriaLink = document.querySelector(`[data-categoria-nav="${categoria}"]`);

  // Clica na aba/menu que ativa a categoria correta (ajuste conforme seu sistema)
  if (categoriaLink) {
    categoriaLink.click();
  }

  // Espera a categoria carregar para rolar até o produto
  setTimeout(() => {
    produto.scrollIntoView({ behavior: 'smooth', block: 'center' });
    produto.classList.add('destacado');
    setTimeout(() => produto.classList.remove('destacado'), 1500);
  }, 300);
}




function alterarQuantidade(botao, delta) {
  const input = botao.parentElement.querySelector('.quantidade');
  const subtotalBox = botao.closest('.produto-info').querySelector('.subtotal-preview');
  let valor = parseInt(input.value) || 1;
  valor += delta;
  if (valor < 1) valor = 1;
  input.value = valor;

  const preco = parseFloat(botao.closest('.produto').getAttribute('data-preco'));

  if (valor > 1) {
    const subtotal = (valor * preco).toFixed(2).replace('.', ',');
    subtotalBox.textContent = `Subtotal: R$ ${subtotal}`;
    subtotalBox.style.display = 'block';
  } else {
    subtotalBox.textContent = '';
    subtotalBox.style.display = 'none';
  }
}

let carrinho = [];
try {
  const data = JSON.parse(localStorage.getItem('carrinho'));
  if (Array.isArray(data)) {
    carrinho = data;
  } else {
    localStorage.removeItem('carrinho'); // limpa objeto corrompido
  }
} catch (e) {
  localStorage.removeItem('carrinho'); // limpa JSON inválido
}



function adicionarAoCarrinho(botao) {
  const card = botao.closest('.produto');
  const nome = card.getAttribute('data-nome');
  const preco = parseFloat(card.getAttribute('data-preco'));
  const tipo = card.getAttribute('data-tipo') || 'unidade';
  const quantidade = parseInt(card.querySelector('.quantidade').value) || 1;
  const imagem = card.querySelector('img')?.src || '';

  // Verifica se o item já está no carrinho
  const itemExistente = carrinho.find(item => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({ nome, preco, quantidade, tipo, imagem });
  }

  // ✅ Salva o carrinho no localStorage
  salvarCarrinho();

  atualizarCarrinho();
  atualizarContadorCarrinho();
  mostrarAlerta(nome, quantidade);

  // Resetar quantidade e subtotal após adicionar
  const input = card.querySelector('.quantidade');
  input.value = 1;
  const subtotalBox = card.querySelector('.subtotal-preview');
  if (subtotalBox) {
    subtotalBox.textContent = '';
    subtotalBox.style.display = 'none';
  }
}


function atualizarCarrinho() {
  const container = document.getElementById('itens-carrinho');
  if (!container) return;

  container.innerHTML = '';
  let total = 0;

  carrinho.forEach(item => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    const div = document.createElement('div');
    div.className = 'carrinho-item';
    div.innerHTML = `
      <div class="carrinho-nome">
        <img src="${item.imagem}" alt="${item.nome}" class="carrinho-miniatura">
        <span>${item.nome}</span>
      </div>
      <div class="carrinho-quantidade">
        <button class="btt" onclick="diminuirQuantidade('${item.nome}')">−</button>
        <span>${item.quantidade}</span>
        <button class="btt" onclick="aumentarQuantidade('${item.nome}')">+</button>
      </div>
      <center>
        <div class="carrinho-subtotal">R$ ${subtotal.toFixed(2)}</div>
      </center>
      <div class="carrinho-acoes">
        <button onclick="removerDoCarrinho('${item.nome}')">
          <img id="imgg" src="assets/images/sistema/excluir.png" alt="">
        </button>
      </div>
    `;
    container.appendChild(div);
  });

  const totalEl = document.getElementById('total');
  if (totalEl) {
    totalEl.textContent = total.toFixed(2);
  }
  atualizarContadorCarrinho();

}


function aumentarQuantidade(nome) {
  const item = carrinho.find(item => item.nome === nome);
  if (item) {
    item.quantidade += 1;
    salvarCarrinho();
    atualizarCarrinho();
  }
}

function diminuirQuantidade(nome) {
  const item = carrinho.find(item => item.nome === nome);
  if (item) {
    if (item.quantidade > 1) {
      item.quantidade -= 1;
    } else {
      carrinho = carrinho.filter(p => p.nome !== nome);
    }
    salvarCarrinho();
    atualizarCarrinho();
  }
}


function removerDoCarrinho(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  salvarCarrinho();
  atualizarCarrinho();
}


function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}
document.addEventListener('DOMContentLoaded', () => {
  atualizarCarrinho(); // Exibe os itens do carrinho salvos no localStorage
});

document.addEventListener('DOMContentLoaded', () => {
  atualizarCarrinho();      // Carrega carrinho salvo
  toggleHeaderScroll();     // Aplica navbar correto
});




function mostrarAlerta(mensagem) {
  const alerta = document.getElementById('alerta');
 alerta.innerHTML = `
  <div class="alerta-nome">${mensagem}</div>
  <hr class="alerta-linha">
  <div class="alerta-sucesso">Adicionado ao carrinho!✅</div>
`;
  alerta.classList.add('show');
  setTimeout(() => alerta.classList.add('hide'), 500);
  setTimeout(() => {
    alerta.classList.remove('show', 'hide');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  const animarTituloCarrinho = document.querySelector('.titulo-carrinho');

  if (animarTituloCarrinho) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animarTituloCarrinho.classList.add('scroll-visivel');
        }
      });
    }, { threshold: 0.5 });

    observer.observe(animarTituloCarrinho);
  }
});


/*========== Scroll Reveal ==========*/
const scrollReveal = ScrollReveal({
    origin: 'top',
    distance: '15px',
    duration: 500,
    reset: true
})

scrollReveal.reveal(
    `#home .image, #home .text,
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



/*========== Botão ir para o carrinho ==========*/
/*========== Botão ir para o carrinho ==========*/
document.addEventListener('DOMContentLoaded', function () {
  const backToTopButton = document.querySelector('.back-to-top');
  const carrinho = document.getElementById('carrinho');

  if (backToTopButton && carrinho) {
    backToTopButton.addEventListener('click', function (e) {
      e.preventDefault();

      const offset = 100; // ajuste de espaço antes do carrinho
      const carrinhoTop = carrinho.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: carrinhoTop - offset,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', function () {
      if (window.scrollY >= 560) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }

      ActivateMenuAtCurrentSection();
    });
  }
});



document.addEventListener('DOMContentLoaded', () => {
    const menuLateral = document.querySelector('.menu-lateral');
    const body = document.body;

    // 1. Criar o botão de hambúrguer dinamicamente
    const menuToggle = document.createElement('button');
    menuToggle.classList.add('menu-toggle');
    menuToggle.setAttribute('aria-label', 'Abrir Menu');
    menuToggle.innerHTML = `
        <span class="hamburger"></span>
        <span class="hamburger"></span>
        <span class="hamburger"></span>
    `;
    document.body.appendChild(menuToggle); // Adiciona o botão ao body

    // 2. Criar o overlay dinamicamente
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay); // Adiciona o overlay ao body

    // 3. Adicionar event listeners
    menuToggle.addEventListener('click', () => {
        menuLateral.classList.toggle('open');
        menuToggle.classList.toggle('open');
        overlay.classList.toggle('active');
        body.classList.toggle('no-scroll'); // Previne scroll do corpo
    });

    overlay.addEventListener('click', () => {
        menuLateral.classList.remove('open');
        menuToggle.classList.remove('open');
        overlay.classList.remove('active');
        body.classList.remove('no-scroll');
    });

    // Fechar o menu ao clicar em um item (opcional)
    const atalhos = document.querySelectorAll('.menu-lateral .atalhos a');
    atalhos.forEach(link => {
        link.addEventListener('click', () => {
            // Verificar se estamos em uma tela pequena (mobile)
            if (window.matchMedia('(max-width: 768px)').matches) {
                menuLateral.classList.remove('open');
                menuToggle.classList.remove('open');
                overlay.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });
    });

    // Ocultar o botão de hambúrguer em telas maiores, caso o JS seja carregado antes do CSS
    const checkMediaQuery = () => {
        if (window.matchMedia('(min-width: 769px)').matches) {
            menuToggle.style.display = 'none';
        } else {
            menuToggle.style.display = 'flex'; // ou 'block' dependendo de como você quer o display
        }
    };

    // Executar ao carregar e ao redimensionar
    checkMediaQuery();
    window.addEventListener('resize', checkMediaQuery);
});
const sections = document.querySelectorAll("section[id]");
  const menuLinks = document.querySelectorAll(".menu-lateral .atalhos a");

  function activateMenuOnScroll() {
    let scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 60; // ajuste se tiver header fixo
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        menuLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", activateMenuOnScroll);

  // Ao clicar no menu, manter a animação ativa
  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      menuLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });



function enviarWhatsApp() {
  const erroEl = document.getElementById('erro-pedido');
  let total = 0;
  let mensagem = "*Olá! Esse é o meu pedido para entrega:*\n\n";

  carrinho.forEach(item => {
    const subtotal = item.tipo === 'peso'
      ? item.preco * (item.quantidade / 100)
      : item.preco * item.quantidade;

    mensagem += item.tipo === 'peso'
      ? `• ${item.quantidade}g de ${item.nome} - R$ ${subtotal.toFixed(2)}\n`
      : `${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2)}\n`;

    total += subtotal;
  });

  if (total < 20) {
    erroEl.textContent = "O valor mínimo para pedido é R$ 20,00.";
    erroEl.classList.add("show");
    erroEl.classList.remove("tremer");
    void erroEl.offsetWidth; // Reinicia a animação
    erroEl.classList.add("tremer");
    return;
  }

  erroEl.classList.remove("show");
  erroEl.textContent = "";

  mensagem += `\n*Total: R$ ${total.toFixed(2)}*`;

  const link = `https://wa.me/558488692337?text=${encodeURIComponent(mensagem)}`;
  window.open(link, '_blank');

  // Limpa carrinho e contador
  carrinho = [];
  salvarCarrinho();
  atualizarCarrinho();
  atualizarContadorCarrinho();
}


function mostrarAlerta(nomeProduto, quantidade) {
  const alerta = document.getElementById("alerta");
  alerta.innerHTML = `<strong>${quantidade}x ${nomeProduto}</strong> adicionado ao carrinho!`;
  alerta.classList.add("show");
  alerta.classList.remove("hide");
  setTimeout(() => {
    alerta.classList.add("hide");
  }, 500);
  setTimeout(() => {
    alerta.classList.remove("show", "hide");
  }, 2500);
}


function atualizarContadorCarrinho() {
  const contador = document.getElementById('contador-carrinho');
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  if (contador) {
    contador.textContent = totalItens;

    // animação simples ao adicionar
    contador.classList.add('animar');
    setTimeout(() => contador.classList.remove('animar'), 200);
  }
}




window.addEventListener('scroll', () => {
  toggleHeaderScroll();
  ActivateMenuAtCurrentSection(); // se você usa isso para navbar ativa
});

document.addEventListener('DOMContentLoaded', () => {
  toggleHeaderScroll(); // aplica o estado correto ao carregar a página
  atualizarCarrinho();  // opcional: preenche carrinho salvo
});
