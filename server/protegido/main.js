// ===============================================
//         Configurações e Utilidades Globais
// ===============================================

// Seletores comuns
const DOMElements = {
    header: document.querySelector("#header"),
    nav: document.querySelector('#header nav'),
    toggleButtons: document.querySelectorAll('nav .toggle'),
    menuLinks: document.querySelectorAll('nav ul li a'),
    backToTopButton: document.querySelector('.back-to-top'),
    sections: document.querySelectorAll('main section[id]'),
    carrinhoContainer: document.getElementById('itens-carrinho'),
    carrinhoTotal: document.getElementById('total'),
    erroPedido: document.getElementById('erro-pedido'),
    alertaAdicionado: document.getElementById("alerta"),
    campoPesquisa: document.getElementById('pesquisa'),
    listaResultadosPesquisa: document.getElementById('resultados-pesquisa'),
    // Para o carrossel principal (se houver)
    carouselSlide: document.getElementById('carouselSlide'),
    carouselPrevBtn: document.getElementById('prevBtn'),
    carouselNextBtn: document.getElementById('nextBtn'),
};

const NAV_HEIGHT = DOMElements.header ? DOMElements.header.offsetHeight : 0;
const MIN_ORDER_VALUE = 20; // Valor mínimo para pedido WhatsApp

// Armazena o estado do carrinho no localStorage
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || {};

function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

/**
 * Normaliza uma string (remove acentos e converte para minúsculas).
 * @param {string} text O texto a ser normalizado.
 * @returns {string} O texto normalizado.
 */
function normalizeText(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

// ===============================================
//                Funcionalidades do Menu
// ===============================================

/**
 * Alterna a classe 'show' no elemento de navegação.
 * @param {Event} event O evento de clique.
 */
function toggleMenuVisibility() {
    DOMElements.nav.classList.toggle('show');
}

/**
 * Fecha o menu removendo a classe 'show'.
 */
function closeMenu() {
    DOMElements.nav.classList.remove('show');
}

// Event listeners para abrir/fechar o menu
DOMElements.toggleButtons.forEach(button => {
    button.addEventListener('click', toggleMenuVisibility);
});

// Event listeners para fechar o menu ao clicar em um link
DOMElements.menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

// ===============================================
//          Efeitos de Scroll e Menu Ativo
// ===============================================

/**
 * Adiciona/remove a classe 'scroll' no header ao rolar a página.
 */
function handleHeaderScroll() {
    if (window.scrollY >= NAV_HEIGHT) {
        DOMElements.header.classList.add('scroll');
    } else {
        DOMElements.header.classList.remove('scroll');
    }
}

/**
 * Ativa o link do menu correspondente à seção visível na tela.
 */
function activateMenuAtCurrentSection() {
    const scrollY = window.scrollY;

    DOMElements.sections.forEach(section => {
        const sectionTop = section.offsetTop - 100; // Ajuste para margem superior
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

// Event listener para rolagem da janela
window.addEventListener('scroll', () => {
    handleHeaderScroll();
    activateMenuAtCurrentSection();
    // Exibe/oculta o botão "voltar ao topo"
    if (window.scrollY >= 560) {
        DOMElements.backToTopButton.classList.add('show');
    } else {
        DOMElements.backToTopButton.classList.remove('show');
    }
});

// ===============================================
//            Botão "Voltar ao Topo"
// ===============================================

DOMElements.backToTopButton.addEventListener('click', function(e) {
    e.preventDefault();
    // Você mencionou '#carrinho' aqui, se o objetivo for rolar para o topo, mude para '#header' ou 'body'
    document.querySelector('#header').scrollIntoView({ behavior: 'smooth' });
});

// ===============================================
//              Animações Scroll Reveal
// ===============================================

const scrollReveal = ScrollReveal({
    origin: 'top',
    distance: '15px',
    duration: 500,
    reset: true
});

scrollReveal.reveal(
    `#home .image, #home .text, #about .title, #about .pp,
     #about .container, #about .carrinho,
     #carro .title, #carro .pp,
     #carro .carousel-container,
     #contact .text, #contact .links,
     footer .brand, footer .social`,
    { interval: 100 }
);

// ===============================================
//            Filtragem de Produtos por Categoria
// ===============================================

/**
 * Mapeia categorias para índices de botão para facilitar a ativação.
 */
const CATEGORY_BUTTON_MAP = {
    alimentos: 0,
    padaria: 1,
    cestas: 2,
    bebidas: 3,
    frios: 4,
    limpeza: 5
};

/**
 * Filtra os produtos exibidos com base na categoria selecionada.
 * @param {string} selectedCategory A categoria a ser exibida.
 */
function filterCategory(selectedCategory) {
    // Remove a classe 'active' de todos os botões de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));

    // Adiciona a classe 'active' ao botão da categoria selecionada
    const targetButtonIndex = CATEGORY_BUTTON_MAP[selectedCategory];
    if (targetButtonIndex !== undefined) {
        document.querySelectorAll('.filtro-btn')[targetButtonIndex]?.classList.add('active');
    }

    // Mostra/esconde produtos com base na categoria
    document.querySelectorAll('.produto').forEach(product => {
        const productCategory = product.getAttribute('data-categoria');
        product.style.display = productCategory === selectedCategory ? 'flex' : 'none';
    });
}

// Adiciona event listeners aos botões de filtro
document.querySelectorAll('.filtro-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.getAttribute('data-filtro'); // Assumindo data-filtro nos botões
        if (category) {
            filterCategory(category);
        }
    });
});

// ===============================================
//             Gerenciamento do Carrinho
// ===============================================

/**
 * Calcula o subtotal de um item do carrinho.
 * @param {object} item O item do carrinho.
 * @returns {number} O subtotal calculado.
 */
function calculateItemSubtotal(item) {
    return item.tipo === 'peso' ? item.preco * (item.quantidade / 100) : item.preco * item.quantidade;
}

/**
 * Altera a quantidade de um produto no preview antes de adicionar ao carrinho.
 * @param {HTMLButtonElement} button O botão clicado (+ ou -).
 * @param {number} delta O valor para adicionar/subtrair (ex: 1 para unidade, 100 para peso).
 */
function changePreviewQuantity(button, delta) {
    const productElement = button.closest('.produto');
    const quantityInput = productElement.querySelector('.quantidade');
    let currentQuantity = parseInt(quantityInput.value) || 0;

    const type = productElement.getAttribute('data-tipo') || 'unidade';

    let newQuantity;
    if (type === 'peso') {
        newQuantity = Math.max(100, currentQuantity + delta); // Mínimo 100g
    } else {
        newQuantity = Math.max(1, currentQuantity + delta); // Mínimo 1 unidade
    }

    quantityInput.value = newQuantity;

    // Atualiza o subtotal no preview
    const price = parseFloat(productElement.getAttribute('data-preco'));
    const subtotalPreviewElement = productElement.querySelector('.subtotal-preview');

    if (subtotalPreviewElement) {
        const subtotal = type === 'peso' ? price * (newQuantity / 100) : price * newQuantity;
        subtotalPreviewElement.textContent = `Subtotal: R$ ${subtotal.toFixed(2)} (${type === 'peso' ? newQuantity.toLocaleString('pt-BR') + 'g' : newQuantity})`;
        subtotalPreviewElement.style.color = 'green';
        subtotalPreviewElement.style.fontWeight = 'bold';
        subtotalPreviewElement.style.marginTop = '5px';
    }
}

/**
 * Adiciona um produto ao carrinho.
 * @param {HTMLButtonElement} button O botão "Adicionar ao Carrinho".
 */
function addToCart(button) {
    const productElement = button.closest('.produto');
    const name = productElement.querySelector('h3').textContent;
    const price = parseFloat(productElement.getAttribute('data-preco'));
    const type = productElement.getAttribute('data-tipo') || 'unidade';
    const quantityInput = productElement.querySelector('.quantidade');
    const quantity = parseInt(quantityInput.value);
    const image = productElement.querySelector('img')?.src;

    // Esconde o subtotal de preview
    const subtotalPreviewElement = productElement.querySelector('.subtotal-preview');
    if (subtotalPreviewElement) subtotalPreviewElement.textContent = '';

    if (carrinho[name]) {
        carrinho[name].quantidade += quantity;
    } else {
        carrinho[name] = { preco: price, quantidade: quantity, imagem: image, tipo: type };
    }

    saveCarrinho();
    updateCartDisplay();
    showAddToCartAlert(name, quantity);

    // Resetar campo de quantidade para o valor padrão da categoria
    quantityInput.value = type === 'peso' ? 100 : 1;
    quantityInput.dispatchEvent(new Event('input')); // Força atualização visual
}

/**
 * Remove um item do carrinho.
 * @param {string} itemName O nome do item a ser removido.
 */
function removeFromCart(itemName) {
    delete carrinho[itemName];
    saveCarrinho();
    updateCartDisplay();
}

/**
 * Aumenta a quantidade de um item no carrinho.
 * @param {string} itemName O nome do item.
 */
function increaseCartQuantity(itemName) {
    const item = carrinho[itemName];
    const type = item.tipo || 'unidade';

    if (type === 'peso') {
        item.quantidade += 100;
    } else {
        item.quantidade += 1;
    }
    saveCarrinho();
    updateCartDisplay();
}

/**
 * Diminui a quantidade de um item no carrinho.
 * @param {string} itemName O nome do item.
 */
function decreaseCartQuantity(itemName) {
    const item = carrinho[itemName];
    const type = item.tipo || 'unidade';

    if (type === 'peso') {
        if (item.quantidade > 100) {
            item.quantidade -= 100;
        }
    } else {
        if (item.quantidade > 1) {
            item.quantidade -= 1;
        }
    }
    saveCarrinho();
    updateCartDisplay();
}

/**
 * Atualiza a exibição do carrinho na interface do usuário.
 */
function updateCartDisplay() {
    DOMElements.carrinhoContainer.innerHTML = '';
    let total = 0;

    for (const name in carrinho) {
        const item = carrinho[name];
        const subtotal = calculateItemSubtotal(item);
        total += subtotal;

        const div = document.createElement('div');
        div.classList.add('carrinho-item');
        div.innerHTML = `
            <div class="carrinho-nome">
                <img src="${item.imagem}" alt="${name}" class="carrinho-miniatura">
                <span>${name}</span>
            </div>
            <div class="carrinho-quantidade">
                <button class="btt" onclick="decreaseCartQuantity('${name}')">−</button>
                <span>${item.tipo === 'peso' ? item.quantidade.toLocaleString('pt-BR') + 'g' : item.quantidade}</span>
                <button class="btt" onclick="increaseCartQuantity('${name}')">+</button>
            </div>
            <center>
                <div class="carrinho-subtotal">R$ ${subtotal.toFixed(2)}</div>
            </center>
            <div class="carrinho-acoes">
                <button onclick="removeFromCart('${name}')">
                    <img id="imgg" src="assets/images/sistema/excluir.png" alt="Excluir">
                </button>
            </div>
        `;
        DOMElements.carrinhoContainer.appendChild(div);
    }
    DOMElements.carrinhoTotal.textContent = total.toFixed(2);
}

/**
 * Envia o pedido via WhatsApp, com verificação de valor mínimo.
 */
function sendWhatsAppOrder() {
    let total = 0;
    let message = "*Olá! Esse é o meu pedido para entrega:*\n\n";

    for (const name in carrinho) {
        const item = carrinho[name];
        const subtotal = calculateItemSubtotal(item);
        total += subtotal;

        if (item.tipo === 'peso') {
            message += `• ${item.quantidade}g de ${name} - R$ ${subtotal.toFixed(2)}\n`;
        } else {
            message += `${item.quantidade}x ${name} - R$ ${subtotal.toFixed(2)}\n`;
        }
    }

    if (total < MIN_ORDER_VALUE) {
        DOMElements.erroPedido.textContent = `O valor mínimo para pedido é R$ ${MIN_ORDER_VALUE.toFixed(2)}.`;
        DOMElements.erroPedido.classList.add("show");
        DOMElements.erroPedido.classList.remove("tremer");
        void DOMElements.erroPedido.offsetWidth; // Força reflow para reanimar
        DOMElements.erroPedido.classList.add("tremer");
        return;
    }

    DOMElements.erroPedido.classList.remove("show");
    DOMElements.erroPedido.textContent = "";

    message += `\n*Total: R$ ${total.toFixed(2)}*`;

    const whatsappLink = `https://wa.me/558488692337?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
}

/**
 * Exibe um alerta visual de produto adicionado ao carrinho.
 * @param {string} productName O nome do produto.
 * @param {number} quantity A quantidade adicionada.
 */
function showAddToCartAlert(productName, quantity) {
    DOMElements.alertaAdicionado.innerHTML = `<strong style="display:inline-block; border-bottom: 1px solid currentColor;">${quantity}x ${productName}</strong> adicionado ao carrinho!`;
    DOMElements.alertaAdicionado.style.opacity = 1;
    DOMElements.alertaAdicionado.style.transform = "translateY(0)";
    setTimeout(() => {
        DOMElements.alertaAdicionado.style.opacity = 0;
        DOMElements.alertaAdicionado.style.transform = "translateY(-20px)";
    }, 2000);
}

// ===============================================
//            Funcionalidade de Pesquisa
// ===============================================

DOMElements.campoPesquisa.addEventListener('input', () => {
    const searchTerm = normalizeText(DOMElements.campoPesquisa.value.trim());
    DOMElements.listaResultadosPesquisa.innerHTML = '';

    if (searchTerm.length < 1) return;

    document.querySelectorAll('.produto').forEach(product => {
        const originalName = product.querySelector('h3')?.textContent || '';
        const normalizedName = normalizeText(originalName);

        // Mostrar apenas produtos que COMEÇAM com o termo digitado
        if (normalizedName.startsWith(searchTerm)) {
            const listItem = document.createElement('li');
            listItem.textContent = originalName;

            listItem.addEventListener('click', () => {
                const category = product.getAttribute('data-categoria');

                // Simula clique no botão da categoria correspondente
                document.querySelectorAll('.filtro-btn').forEach(btn => {
                    if (btn.getAttribute('data-filtro') === category) {
                        btn.click();
                    }
                });

                setTimeout(() => {
                    // Rola até o produto
                    product.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Aplica classe com efeito visual
                    product.classList.add('encontrado');

                    // Remove o efeito após 2 segundos
                    setTimeout(() => {
                        product.classList.remove('encontrado');
                    }, 2000);
                }, 200);

                DOMElements.campoPesquisa.value = '';
                DOMElements.listaResultadosPesquisa.innerHTML = '';
            });
            DOMElements.listaResultadosPesquisa.appendChild(listItem);
        }
    });
});

// ===============================================
//          Carrossel Principal (se aplicável)
// ===============================================

// Assumindo que este carrossel existe na sua página (o seletor DOMElements.carouselSlide)
if (DOMElements.carouselSlide) {
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentIndex = 0;
    let autoplayInterval;

    function updateCarouselDisplay() {
        DOMElements.carouselSlide.style.transform = `translateX(${-currentIndex * 100}%)`;
    }

    function goToNextSlide() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarouselDisplay();
    }

    function goToPrevSlide() {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarouselDisplay();
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    function startAutoplay() {
        autoplayInterval = setInterval(goToNextSlide, 5000); // Muda a cada 5 segundos
    }

    DOMElements.carouselNextBtn?.addEventListener('click', () => {
        goToNextSlide();
        resetAutoplay();
    });

    DOMElements.carouselPrevBtn?.addEventListener('click', () => {
        goToPrevSlide();
        resetAutoplay();
    });

    // Inicia o autoplay ao carregar a página
    startAutoplay();
}

// ===============================================
//       Carrosséis de Variação de Produto
// ===============================================

document.querySelectorAll('.produto.carrossel').forEach(productElement => {
    const variations = JSON.parse(productElement.getAttribute('data-variacoes'));
    const largeImage = productElement.querySelector('.imagem-grande-wrapper img');
    const productNameDisplay = productElement.querySelector('h3');
    const productPriceDisplay = productElement.querySelector('p');
    const thumbsContainer = productElement.querySelector('.carousel-thumbs');
    const prevButton = productElement.querySelector('.carousel-prev');
    const nextButton = productElement.querySelector('.carousel-next');

    let currentVariationIndex = 0;

    /**
     * Atualiza a exibição do produto com base na variação atual.
     */
    const updateProductVariation = () => {
        const currentVariation = variations[currentVariationIndex];
        largeImage.src = currentVariation.img;
        productNameDisplay.textContent = currentVariation.nome;
        productPriceDisplay.textContent = `R$ ${currentVariation.preco.toFixed(2)}`;
        productElement.setAttribute('data-nome', currentVariation.nome);
        productElement.setAttribute('data-preco', currentVariation.preco);

        // Atualiza a classe 'active' das miniaturas e rola para a ativa
        thumbsContainer.querySelectorAll('img').forEach((thumb, idx) => {
            thumb.classList.toggle('active', idx === currentVariationIndex);
            if (idx === currentVariationIndex) {
                thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        });
    };

    // Cria as miniaturas dinamicamente
    thumbsContainer.innerHTML = '';
    variations.forEach((item, index) => {
        const thumb = document.createElement('img');
        thumb.src = item.img;
        thumb.alt = item.nome;
        if (index === currentVariationIndex) thumb.classList.add('active');
        thumb.addEventListener('click', () => {
            currentVariationIndex = index;
            updateProductVariation();
        });
        thumbsContainer.appendChild(thumb);
    });

    // Adiciona event listeners para navegação das variações
    prevButton?.addEventListener('click', () => {
        currentVariationIndex = (currentVariationIndex - 1 + variations.length) % variations.length;
        updateProductVariation();
    });

    nextButton?.addEventListener('click', () => {
        currentVariationIndex = (currentVariationIndex + 1) % variations.length;
        updateProductVariation();
    });

    // Inicializa a exibição da variação
    updateProductVariation();
});

// ===============================================
//              Inicialização da Página
// ===============================================

// Funções globais expostas para onclick (se necessário, mas considere adicionar listeners)
window.changePreviewQuantity = changePreviewQuantity;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseCartQuantity = increaseCartQuantity;
window.decreaseCartQuantity = decreaseCartQuantity;
window.sendWhatsAppOrder = sendWhatsAppOrder;
window.filterCategory = filterCategory; // Expor se os botões usam onclick

window.onload = () => {
    updateCartDisplay();
    filterCategory('alimentos'); // Mostra apenas os produtos de alimentos por padrão
    handleHeaderScroll(); // Garante que o header esteja correto ao carregar
    activateMenuAtCurrentSection(); // Ativa a seção inicial
};