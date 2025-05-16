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

    const checkpoint = window.pageYOffset + (window.innerHeight / 8) * 4

    for( const section of sections) {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight
        const sectionId = section.getAttribute('id')

        const checkpointStart = checkpoint >= sectionTop
        const checkpointEnd = checkpoint <= sectionTop + sectionHeight

        if (checkpointStart && checkpointEnd) {
            document.querySelector('nav ul li a[href*=' + sectionId + ']' ).classList.add('active')
        }
        else {
            document.querySelector('nav ul li a[href*=' + sectionId + ']' ).classList.remove('active')

        }


    }
    
}

/*========== Botão que quando pressionado, voltar para o topo ========== */

const backToTopButton = document.querySelector('.back-to-top')

window.addEventListener('scroll', function() {
    if(window.scrollY >= 560) {
        backToTopButton.classList.add('show')
    }
    else {
        backToTopButton.classList.remove('show')
    }
    ActivateMenuAtCurrentSection()
})



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
    const input = botao.parentElement.querySelector('.quantidade');
    let valor = parseInt(input.value) + delta;
    input.value = Math.max(1, valor);
  }

  function adicionarAoCarrinho(botao) {
    const produtoEl = botao.closest('.produto');
    const nome = produtoEl.getAttribute('data-nome');
    const preco = parseFloat(produtoEl.getAttribute('data-preco'));
    const quantidade = parseInt(produtoEl.querySelector('.quantidade').value);

    if (carrinho[nome]) {
      carrinho[nome].quantidade += quantidade;
    } else {
      carrinho[nome] = { preco, quantidade };
    }

    salvarCarrinho();
    atualizarCarrinho();
    mostrarAlerta();
  }

  function removerDoCarrinho(nome) {
    delete carrinho[nome];
    salvarCarrinho();
    atualizarCarrinho();
  }

  function diminuirQuantidade(nome) {
    if (carrinho[nome]) {
      carrinho[nome].quantidade -= 1;
      if (carrinho[nome].quantidade <= 0) {
        removerDoCarrinho(nome);
      } else {
        salvarCarrinho();
        atualizarCarrinho();
      }
    }
  }
  function aumentarQuantidade(nome) {
  if (carrinho[nome]) {
    carrinho[nome].quantidade += 1;
    salvarCarrinho();
    atualizarCarrinho();
  }
}


  function atualizarCarrinho() {
  const container = document.getElementById('itens-carrinho');
  container.innerHTML = '';
  let total = 0;

  for (const nome in carrinho) {
    const item = carrinho[nome];
    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    const div = document.createElement('div');
    div.classList.add('carrinho-item');

    div.innerHTML = `
      <div class="carrinho-nome">${nome}</div>

      <div class="carrinho-quantidade">
        <button class="btt" onclick="diminuirQuantidade('${nome}')">−</button>
        <span>${item.quantidade}</span>
        <button class="btt" onclick="aumentarQuantidade('${nome}')">+</button>
      </div>
<center>
      <div class="carrinho-subtotal">R$ ${subtotal.toFixed(2)}</div>
</center>
      <div class="carrinho-acoes">
        <button onclick="removerDoCarrinho('${nome}')">

          <img id="imgg"; src="assets/images/sistema/excluir.png" alt="">
        </button>
      </div>
    `;

    container.appendChild(div);
  }

  document.getElementById('total').textContent = total.toFixed(2);
}

  function enviarWhatsApp() {
  fetch('/pedido', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(carrinho)
  })
  .then(res => {
    if (!res.ok) throw new Error("Erro ao enviar pedido.");
    return res.json();
  })
  .then(data => {
    window.open(data.url, '_blank');
  })
  .catch(err => {
    alert("Erro ao enviar pedido. Verifique o valor ou tente novamente.");
    console.error(err);
  });
}



  function mostrarAlerta() {
  const alerta = document.getElementById("alerta");
  alerta.style.opacity = 1;
  alerta.style.transform = "translateY(0)";
  setTimeout(() => {
    alerta.style.opacity = 0;
    alerta.style.transform = "translateY(-20px)";
  }, 2000); // desaparece após 2 segundos
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

    