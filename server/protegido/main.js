let produtos = [];

async function carregarProdutos() {
  try {
    const res = await fetch('/produtos');
    produtos = await res.json();
    renderizarProdutos(produtos);            // ✅ Adiciona essa linha
    filtrarCategoria('mercearia');           // 👉 Mostra só os de "mercearia"
  } catch (err) {
    console.error('Erro ao carregar produtos do servidor', err);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
});



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
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.querySelector('.back-to-top');
    const carrinho = document.getElementById('carrinho');

    if (backToTopButton && carrinho) {
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            carrinho.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        window.addEventListener('scroll', function() {
            if (window.scrollY >= 560) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
            ActivateMenuAtCurrentSection();
        });
    }
});

function renderizarProdutos(produtos) {
  const lista = document.getElementById('lista-produtos');
  lista.innerHTML = '';

  produtos.forEach(prod => {
    // ✅ Verifica se é um card com variações (mais de um produto no mesmo card)
    if (prod.variacoes && prod.variacoes.length > 0) {
      lista.appendChild(renderizarCardComVariacoes(prod));
    } else {
      lista.appendChild(renderizarCardUnico(prod));
    }
  });
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
  // Remove .active de todos os botões
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));

  // Ativa o botão atual
  const botaoAtivo = document.querySelector(`.filtro-btn[data-categoria="${categoriaSelecionada}"]`);
  if (botaoAtivo) {
    botaoAtivo.classList.add('active');
  }

  // Filtrar os produtos carregados do banco
  const produtosFiltrados = categoriaSelecionada === 'todos'
    ? produtos
    : produtos.filter(prod => prod.categoria === categoriaSelecionada);

  renderizarProdutos(produtosFiltrados); // Recria os cards na tela

  // Scroll suave
  const areaProdutos = document.querySelector('.pp');
  if (areaProdutos) {
    areaProdutos.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/*========== Carrinho ==========*/
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || {}

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho))
}

function alterarQuantidade(botao, delta) {
    const produtoEl = botao.closest('.produto');
    const input = produtoEl.querySelector('.quantidade');
    let valor = parseInt(input.value) || 0;
    const tipo = produtoEl.getAttribute('data-tipo') || 'unidade';

    if (tipo === 'peso') {
        valor = valor <= 0 ? 100 : valor;
        valor += delta * 100;
        valor = Math.max(100, valor);
    } else {
        valor = valor <= 0 ? 1 : valor;
        valor += delta;
        valor = Math.max(1, valor);
    }

    input.value = valor;

    const preco = parseFloat(produtoEl.getAttribute('data-preco'));
    const subtotalEl = produtoEl.querySelector('.subtotal-preview');
    if (subtotalEl) {
        if ((tipo === 'peso' && valor >= 100) || (tipo === 'unidade' && valor >= 1)) {
            let subtotal = tipo === 'peso' ? preco * (valor / 100) : preco * valor;
            subtotalEl.textContent = tipo === 'peso'
                ? `Subtotal: R$ ${subtotal.toFixed(2)} (${valor}g)`
                : `Subtotal: R$ ${subtotal.toFixed(2)}`;
            subtotalEl.style.color = 'green';
            subtotalEl.style.fontWeight = 'bold';
            subtotalEl.style.marginTop = '5px';
        } else {
            subtotalEl.textContent = '';
        }
    }

    botao.blur();
    input.blur();
}



function adicionarAoCarrinho(botao) {
    const produtoEl = botao.closest('.produto')
    // Verifica se é um produto carrossel com variações ou um produto simples
    const isCarrosselProduto = produtoEl.classList.contains('carrossel');
    let nome, preco, imagem;

    if (isCarrosselProduto) {
        // Para produtos carrossel, pegamos os dados atualizados pelo carrossel
        nome = produtoEl.getAttribute('data-nome');
        preco = parseFloat(produtoEl.getAttribute('data-preco'));
        imagem = produtoEl.querySelector('.imagem-grande-wrapper img')?.src; // Pega a imagem grande atual
    } else {
        // Para produtos normais, pegamos os dados diretos
        nome = produtoEl.querySelector('h3').textContent;
        preco = parseFloat(produtoEl.getAttribute('data-preco'));
        imagem = produtoEl.querySelector('img')?.src;
    }

    const tipo = produtoEl.getAttribute('data-tipo') || 'unidade'
    const quantidadeInput = produtoEl.querySelector('.quantidade')
    let quantidade = parseInt(quantidadeInput.value)

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

    // Reseta a quantidade para o valor inicial
    quantidadeInput.value = tipo === 'peso' ? 100 : 1

    // NOVO: Garante que o botão "Adicionar" também perca o foco
    botao.blur();
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
    } else if ((tipo === 'peso' && item.quantidade === 100) || (tipo === 'unidade' && item.quantidade === 1)) {
        // Se a quantidade mínima for atingida, remove o item
        removerDoCarrinho(nome);
        return; // Sai da função para evitar o salvamento duplicado
    }
    salvarCarrinho()
    atualizarCarrinho()
}

function atualizarCarrinho() {
    const container = document.getElementById('itens-carrinho')
    if (!container) return; // Garante que o container existe

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

    const totalEl = document.getElementById('total');
    if (totalEl) {
        totalEl.textContent = total.toFixed(2);
    }
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
        void erroEl.offsetWidth // Reinicia a animação
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
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.produto.carrossel').forEach(produto => {
    const variacoes = JSON.parse(produto.getAttribute('data-variacoes') || '[]');
    if (!variacoes.length) return;

    const imgGrande = produto.querySelector('.imagem-grande-wrapper img');
    const nomeProduto = produto.querySelector('h3');
    const precoProduto = produto.querySelector('p');
    const thumbsContainer = produto.querySelector('.carousel-thumbs');
    const prevBtn = produto.querySelector('.carousel-prev');
    const nextBtn = produto.querySelector('.carousel-next');

    let current = 0;
    const thumbs = [];

    if (thumbsContainer) {
      thumbsContainer.innerHTML = ''; // Garante que não duplique
      variacoes.forEach((variacao, index) => {
        const thumb = document.createElement('img');
        thumb.src = variacao.img;
        thumb.alt = variacao.nome;
        thumb.addEventListener('click', () => {
          current = index;
          updateProduto();
        });
        thumbsContainer.appendChild(thumb);
        thumbs.push(thumb);
      });
    }

    function updateProduto() {
      const v = variacoes[current];
      imgGrande.src = v.img;
      nomeProduto.textContent = v.nome;
      precoProduto.textContent = `R$ ${parseFloat(v.preco).toFixed(2)}`;
      produto.setAttribute('data-nome', v.nome);
      produto.setAttribute('data-preco', v.preco);

      const tipo = produto.getAttribute('data-tipo') || 'unidade';
      const inputQuantidade = produto.querySelector('.quantidade');
      if (inputQuantidade) inputQuantidade.value = tipo === 'peso' ? 100 : 1;

      const subtotalEl = produto.querySelector('.subtotal-preview');
      if (subtotalEl) subtotalEl.textContent = '';

      thumbs.forEach((img, index) => {
        img.classList.toggle('ativo', index === current);
      });

      if (thumbs[current]) {
        thumbs[current].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        current = (current - 1 + variacoes.length) % variacoes.length;
        updateProduto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        current = (current + 1) % variacoes.length;
        updateProduto();
      });
    }

    updateProduto();
  });
});




function toggleHeaderScroll() {
    const divider = document.querySelector('.divider-1');
    const dividerPosition = divider.offsetTop;

    if (window.scrollY >= dividerPosition) {
        header.classList.add('scroll');
    } else {
        header.classList.remove('scroll');
    }
}

window.addEventListener('scroll', toggleHeaderScroll);

const inputPesquisa = document.getElementById('pesquisa');
const resultadosPesquisa = document.getElementById('resultados-pesquisa');

// Função para remover acentos e normalizar texto
function removerAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

inputPesquisa.addEventListener('input', function() {
    const termo = removerAcentos(inputPesquisa.value.trim());
    resultadosPesquisa.innerHTML = '';

    if (termo.length < 1) {
        resultadosPesquisa.style.display = 'none';
        return;
    }

    const produtos = document.querySelectorAll('.produto');

    const resultados = Array.from(produtos).filter(produto => {
        const nomeOriginal = produto.getAttribute('data-nome') || '';
        const nomeNormalizado = removerAcentos(nomeOriginal);
        return nomeNormalizado.includes(termo);
    });

    if (resultados.length === 0) {
        resultadosPesquisa.style.display = 'block';
        const li = document.createElement('li');
        li.textContent = 'Nenhum produto encontrado';
        resultadosPesquisa.appendChild(li);
    } else {
        resultadosPesquisa.style.display = 'block';

        resultados.slice(0, 6).forEach(produto => {
            const li = document.createElement('li');
            li.textContent = produto.getAttribute('data-nome');

            li.addEventListener('click', function() {
                const categoria = produto.getAttribute('data-categoria');

                filtrarCategoria(categoria);

                setTimeout(() => {
                    produto.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    produto.classList.add('highlight');
                    setTimeout(() => {
                        produto.classList.remove('highlight');
                    }, 2500);
                }, 300);

                resultadosPesquisa.innerHTML = '';
                resultadosPesquisa.style.display = 'none';
                inputPesquisa.value = '';
            });

            resultadosPesquisa.appendChild(li);
        });
    }
});

// Ocultar a lista ao clicar fora da barra de pesquisa e da lista
document.addEventListener('click', function(event) {
    if (!inputPesquisa.contains(event.target) && !resultadosPesquisa.contains(event.target)) {
        resultadosPesquisa.innerHTML = '';
        resultadosPesquisa.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const carrinho = document.getElementById('carrinho');

    if (!header || !carrinho) return;

    window.addEventListener('scroll', function() {
        const carrinhoRect = carrinho.getBoundingClientRect();
        const carrinhoTopInPage = window.scrollY + carrinhoRect.top;
        const scrollY = window.scrollY;

        // Se o scroll já passou o topo do carrinho → encolhe
        if (scrollY >= carrinhoTopInPage) {
            header.classList.add('hidden-navbar');
        } else {
            header.classList.remove('hidden-navbar');
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const toggleDarkMode = document.getElementById('toggle-dark-mode');

    // Carrega o estado salvo
    if (localStorage.getItem('modoEscuro') === 'ativado') {
        document.body.classList.add('dark-mode');
        toggleDarkMode.innerHTML = `☀️ <span class="dark-mode-label">Modo Claro</span>`;
    }

    toggleDarkMode.addEventListener('click', function(e) {
        e.preventDefault();

        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('modoEscuro', 'desativado');
            toggleDarkMode.innerHTML = `🌙 <span class="dark-mode-label">Modo Escuro</span>`;
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('modoEscuro', 'ativado');
            toggleDarkMode.innerHTML = `☀️ <span class="dark-mode-label">Modo Claro</span>`;
        }
    });
});


document.addEventListener('click', function(event) {
    const nav = document.querySelector('nav.container');
    const toggle = document.querySelector('.toggle.icon-menu');

    const isClickInsideNav = nav.contains(event.target);
    const isClickOnToggle = event.target.closest('.toggle');

    // Se o menu estiver aberto e o clique for fora do nav e fora do toggle, fecha o menu
    if (nav.classList.contains('show') && !isClickInsideNav && !isClickOnToggle) {
        nav.classList.remove('show');
    }
});





