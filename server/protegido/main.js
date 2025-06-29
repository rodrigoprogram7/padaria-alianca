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

const header = document.querySelector('#header');
function toggleHeaderScroll() {
  const divider = document.querySelector('.divider-1');
  if (!divider) return;
  const dividerPosition = divider.offsetTop;
  if (window.scrollY >= dividerPosition) {
    header.classList.add('scroll');
  } else {
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

  renderizarProdutos(produtosFiltrados);

  const areaProdutos = document.querySelector('.pp');
  if (areaProdutos) {
    areaProdutos.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const encontrados = produtos.filter(prod =>
      (prod.nome || '').toLowerCase().includes(termo)
    );

    if (encontrados.length > 0) {
      resultadosPesquisa.style.display = 'block';
      encontrados.forEach(prod => {
        const li = document.createElement('li');
        li.textContent = prod.nome;
        li.addEventListener('click', () => {
          inputPesquisa.value = '';
          resultadosPesquisa.style.display = 'none';
          const prodEl = [...document.querySelectorAll('.produto')]
            .find(el => el.getAttribute('data-nome')?.toLowerCase() === prod.nome.toLowerCase());
          if (prodEl) {
            prodEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            prodEl.classList.add('highlight');
            setTimeout(() => prodEl.classList.remove('highlight'), 2000);
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
      precoProduto.textContent = `R$ ${parseFloat(v.preco).toFixed(2)}`;
      produto.setAttribute('data-nome', v.nome);
      produto.setAttribute('data-preco', v.preco);
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
