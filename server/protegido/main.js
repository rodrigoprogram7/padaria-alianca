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
  const divider = document.querySelector('.divider-1');
  const carrinho = document.querySelector('.carrinho');

  if (!header || !divider || !carrinho) return;

  const scrollY = window.scrollY;
  const dividerTop = divider.offsetTop;
  const carrinhoTop = carrinho.offsetTop;

  /*
    Lógica:
    - scroll < dividerTop            → navbar pequeno
    - entre dividerTop e carrinhoTop → navbar grande
    - scroll >= carrinhoTop          → navbar pequeno
  */
  if (scrollY < dividerTop) {
    header.classList.remove('scroll'); // pequeno
  } else if (scrollY >= dividerTop && scrollY < carrinhoTop - 200) {
    header.classList.add('scroll'); // grande
  } else if (scrollY >= carrinhoTop - 200) {
    header.classList.remove('scroll'); // pequeno
  }
}

let jaDeslizouCategorias = false;

function toggleHeaderScroll() {
  const header = document.querySelector('#header');
  const divider = document.querySelector('.divider-1');
  const carrinho = document.querySelector('.carrinho');
  const categoriasBar = document.querySelector('.categorias-navbar');

  if (!header || !divider || !carrinho || !categoriasBar) return;

  const scrollY = window.scrollY;
  const dividerTop = divider.offsetTop;
  const carrinhoTop = carrinho.offsetTop;

  if (scrollY < dividerTop) {
    header.classList.remove('scroll');
  } else if (scrollY >= dividerTop && scrollY < carrinhoTop - 200) {
    header.classList.add('scroll');

    if (!jaDeslizouCategorias) {
      jaDeslizouCategorias = true;

      setTimeout(() => {
        categoriasBar.scrollTo({ left: categoriasBar.scrollWidth, behavior: 'smooth' });

        setTimeout(() => {
          categoriasBar.scrollTo({ left: 0, behavior: 'smooth' });
        }, 500); // Espera meio segundo antes de voltar
      }, 300); // Espera navbar terminar de expandir
    }

  } else if (scrollY >= carrinhoTop - 200) {
    header.classList.remove('scroll');
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
  toggleHeaderScroll();
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
      <button class="carousel-btn carousel-prev">❮</button>
      <button class="carousel-btn carousel-next">❯</button>
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

  const areaProdutos = document.querySelector('.pp');
  if (areaProdutos) {
    areaProdutos.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const encontrados = produtos.filter(prod => {
      const nomeProduto = prod.nome?.toLowerCase() || '';
      if (nomeProduto.includes(termo)) return true;

      if (Array.isArray(prod.variacoes)) {
        return prod.variacoes.some(v => v.nome?.toLowerCase().includes(termo));
      }

      return false;
    });

    if (encontrados.length > 0) {
      resultadosPesquisa.style.display = 'block';

      encontrados.forEach(prod => {
        // 🟨 Nome que será exibido na sugestão
        let nomeExibido = prod.nome;
        if (!nomeExibido && Array.isArray(prod.variacoes)) {
          const variacao = prod.variacoes.find(v =>
            v.nome?.toLowerCase().includes(termo)
          );
          nomeExibido = variacao?.nome || prod.variacoes[0]?.nome || 'Produto';
        }

        const li = document.createElement('li');
        li.textContent = nomeExibido;

        li.addEventListener('click', () => {
          inputPesquisa.value = '';
          resultadosPesquisa.style.display = 'none';

          // 🟨 Nome real para buscar no DOM
          let nomeBuscado = '';
          if (prod.nome) {
            nomeBuscado = prod.nome.toLowerCase();
          } else if (Array.isArray(prod.variacoes)) {
            const variacao = prod.variacoes.find(v =>
              v.nome?.toLowerCase().includes(termo)
            );
            nomeBuscado = variacao?.nome?.toLowerCase() || prod.variacoes[0]?.nome?.toLowerCase();
          }

         const aplicarScroll = () => {
          const tentarScroll = () => {
            const produtosDOM = document.querySelectorAll('.produto');
            const alvo = [...produtosDOM].find(el =>
              el.getAttribute('data-nome')?.toLowerCase() === nomeBuscado
            );

            if (alvo) {
              const y = alvo.getBoundingClientRect().top + window.scrollY - 250; // -250 para deixar com margem no topo
              window.scrollTo({ top: y, behavior: 'smooth' });

              alvo.classList.add('highlight');
              setTimeout(() => alvo.classList.remove('highlight'), 2000);
              return true;
            }
            return false;
          };

          let tentativas = 0;
          const intervalo = setInterval(() => {
            tentativas++;
            const encontrou = tentarScroll();
            if (encontrou || tentativas >= 20) {
              clearInterval(intervalo);
            }
          }, 200); // tenta 20x em até 4 segundos
        };





          const categoria = prod.categoria?.toLowerCase();
          if (categoria) {
            filtrarCategoria(categoria);

            setTimeout(() => {
              requestAnimationFrame(() => {
                aplicarScroll();

                // Scroll horizontal da barra de categorias
                const btnCategoria = document.querySelector(`.filtro-btn[data-categoria="${categoria}"]`);
                const barraCategorias = document.querySelector('.categorias-navbar');

                if (btnCategoria && barraCategorias) {
                  const btnLeft = btnCategoria.offsetLeft;
                  const btnWidth = btnCategoria.offsetWidth;
                  const barraWidth = barraCategorias.offsetWidth;

                  const scrollTo = btnLeft - (barraWidth / 2) + (btnWidth / 2);

                  barraCategorias.scrollTo({
                    left: scrollTo,
                    behavior: 'smooth'
                  });
                }
              });
            }, 300);
          } else {
            aplicarScroll();
          }
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

  // Resetar quantidade ao trocar variação
  const inputQuantidade = produto.querySelector('.quantidade');
  if (inputQuantidade) {
    inputQuantidade.value = 1;
  }

  // Ocultar subtotal ao trocar variação
  const subtotalBox = produto.querySelector('.subtotal-preview');
  if (subtotalBox) {
    subtotalBox.textContent = '';
    subtotalBox.style.display = 'none';
  }

  // Atualizar destaque da miniatura
  thumbs.forEach((img, i) => img.classList.toggle('ativo', i === current));
}


    prevBtn.addEventListener('click', () => {
      current = (current - 1 + variacoes.length) % variacoes.length;
      updateProduto();
    });

    nextBtn.addEventListener('click', () => {
      current = (current + 1) % variacoes.length;
      updateProduto();
    });

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
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
