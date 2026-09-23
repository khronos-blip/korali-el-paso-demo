(() => {
  'use strict';

  const PREFIX = '/demos/el-paso/';
  const STORAGE = 'el-paso-demo-v1';
  const products = [
    {id:'cafe', name:'Bocados del café', brand:'Gourmet & café', category:'gourmet', image:'elpaso-03.jpg', alt:'Preparación de pequeños rollos horneados con crema de chocolate', description:'Una muestra de la propuesta gourmet y de café que convive con la experiencia de tienda. Sabores y disponibilidad se confirman directamente.'},
    {id:'chaleco', name:'Chaleco de contraste', brand:'Selección de moda', category:'moda', image:'elpaso-04.jpg', alt:'Chaleco negro sin mangas con botones dorados', description:'Una pieza de silueta limpia con contraste de botones dorados, presentada como referencia de la curaduría de moda de El Paso.'},
    {id:'activewear', name:'Edición movimiento', brand:'Moda activa', category:'moda', image:'elpaso-05.jpg', alt:'Perchero con prendas deportivas en colores variados', description:'Color, funcionalidad y energía en una selección visual de moda activa. Diseños, tallas y disponibilidad deben confirmarse.'},
    {id:'encaje', name:'Top con encaje', brand:'Selección de moda', category:'moda', image:'elpaso-06.jpg', alt:'Top color cacao con terminación inferior de encaje', description:'Texturas suaves y un borde de encaje expresivo en una pieza de inspiración casual. Composición y tallas por confirmar.'},
    {id:'belleza', name:'Ritual de hidratación', brand:'Medicube · selección belleza', category:'belleza', image:'elpaso-07.jpg', alt:'Presentación de cremas hidratantes en cápsulas de Medicube', description:'Skincare coreano presentado en la selección pública de la tienda. Variante, indicaciones y disponibilidad se confirman directamente.'},
    {id:'estilismo', name:'Acentos de autor', brand:'Accesorios & estilismo', category:'accesorios', image:'elpaso-08.jpg', alt:'Estilismo en tonos chocolate con collar, pulseras y bolso', description:'Accesorios que transforman un look: joyería, bolso y capas de textura reunidos como inspiración editorial.'}
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = {category:'all', query:'', cart:{}, wishlist:[], lastConfirmation:null};

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || '{}');
      if (saved.cart && typeof saved.cart === 'object') state.cart = saved.cart;
      if (Array.isArray(saved.wishlist)) state.wishlist = saved.wishlist.filter(id => products.some(p => p.id === id));
      if (saved.lastConfirmation) state.lastConfirmation = saved.lastConfirmation;
      Object.keys(state.cart).forEach(id => {
        if (!products.some(p => p.id === id) || !Number.isInteger(state.cart[id]) || state.cart[id] < 1) delete state.cart[id];
      });
    } catch (_) { localStorage.removeItem(STORAGE); }
  }

  function saveState() {
    localStorage.setItem(STORAGE, JSON.stringify({cart:state.cart, wishlist:state.wishlist, lastConfirmation:state.lastConfirmation}));
  }

  function productById(id) { return products.find(product => product.id === id); }
  function imageUrl(product) { return `${PREFIX}assets/images/${product.image}`; }
  function totalQuantity() { return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0); }

  function heartIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.7 0L12 5.7l-1.1-1.1a5.4 5.4 0 1 0-7.7 7.7L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.7Z"/></svg>';
  }

  function renderProducts() {
    const terms = state.query.toLocaleLowerCase('es').trim();
    const visible = products.filter(product => {
      const categoryMatch = state.category === 'all' || product.category === state.category;
      const text = `${product.name} ${product.brand} ${product.category} ${product.description}`.toLocaleLowerCase('es');
      return categoryMatch && (!terms || text.includes(terms));
    });
    $('#productGrid').innerHTML = visible.map(product => `
      <article class="product-card" data-id="${product.id}">
        <div class="product-image" role="button" tabindex="0" aria-label="Ver ${product.name}">
          <img src="${imageUrl(product)}" alt="${product.alt}" width="1080" height="1350" loading="lazy">
          <button class="wish-button ${state.wishlist.includes(product.id) ? 'active' : ''}" aria-label="${state.wishlist.includes(product.id) ? 'Quitar de' : 'Añadir a'} favoritos" data-wish="${product.id}">${heartIcon()}</button>
          <div class="product-tags"><span>${product.category === 'gourmet' ? 'Café' : product.category}</span></div>
        </div>
        <div class="product-info"><p class="brand">${product.brand}</p><h3>${product.name}</h3><span class="price">Por confirmar</span><button data-detail="${product.id}">Ver detalle</button></div>
      </article>`).join('');
    $('#emptyState').hidden = visible.length !== 0;
  }

  function renderCounts() {
    $('#cartCount').textContent = totalQuantity();
    $('#wishlistCount').textContent = state.wishlist.length;
  }

  function renderCart() {
    const entries = Object.entries(state.cart).map(([id, qty]) => ({product:productById(id), qty})).filter(x => x.product);
    $('#cartItems').innerHTML = entries.length ? entries.map(({product, qty}) => `
      <article class="line-item">
        <img src="${imageUrl(product)}" alt="" width="80" height="100">
        <div><p>${product.brand}</p><h3>${product.name}</h3><p>Por confirmar</p><div class="qty" aria-label="Cantidad"><button data-qty="${product.id}" data-change="-1" aria-label="Reducir cantidad">−</button><span>${qty}</span><button data-qty="${product.id}" data-change="1" aria-label="Aumentar cantidad">+</button></div></div>
        <button class="remove" data-remove="${product.id}" aria-label="Quitar ${product.name}">×</button>
      </article>`).join('') : '<div class="drawer-empty"><p>Tu bolsa está lista<br>para una buena elección.</p></div>';
    $('#checkoutButton').disabled = entries.length === 0;
    $('#summaryCount').textContent = `${totalQuantity()} ${totalQuantity() === 1 ? 'artículo' : 'artículos'}`;
  }

  function renderWishlist() {
    const items = state.wishlist.map(productById).filter(Boolean);
    $('#wishlistItems').innerHTML = items.length ? items.map(product => `
      <article class="line-item wishlist-item"><img src="${imageUrl(product)}" alt="" width="80" height="100"><div><p>${product.brand}</p><h3>${product.name}</h3><p>Por confirmar</p><button data-wish-cart="${product.id}">Añadir a la bolsa</button></div><button class="remove" data-wish="${product.id}" aria-label="Quitar ${product.name}">×</button></article>`).join('') : '<div class="drawer-empty"><p>Guarda aquí las piezas<br>que quieras volver a ver.</p></div>';
  }

  function updateUI() { renderProducts(); renderCounts(); renderCart(); renderWishlist(); }

  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => el.classList.remove('show'), 2200);
  }

  function toggleWishlist(id) {
    state.wishlist = state.wishlist.includes(id) ? state.wishlist.filter(x => x !== id) : [...state.wishlist, id];
    saveState(); updateUI(); toast(state.wishlist.includes(id) ? 'Guardado en favoritos' : 'Eliminado de favoritos');
  }

  function addToCart(id, qty = 1) {
    state.cart[id] = (state.cart[id] || 0) + qty;
    saveState(); updateUI(); toast('Añadido a tu bolsa');
  }

  function changeQuantity(id, change) {
    const next = (state.cart[id] || 0) + change;
    if (next < 1) delete state.cart[id]; else state.cart[id] = Math.min(next, 99);
    saveState(); updateUI();
  }

  function removeCart(id) { delete state.cart[id]; saveState(); updateUI(); }

  function closeOverlays() {
    $$('.drawer.open').forEach(drawer => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); });
    if ($('#backdrop')) $('#backdrop').hidden = true;
    document.body.classList.remove('locked');
    $$('dialog[open]').forEach(dialog => dialog.close());
  }

  function openDrawer(id) {
    closeOverlays(); const drawer = $(id); drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false');
    $('#backdrop').hidden = false; document.body.classList.add('locked'); $('.close-btn', drawer).focus();
  }

  function openProduct(id) {
    const product = productById(id); if (!product) return;
    $('#productDetail').innerHTML = `<div class="product-detail"><div class="detail-image"><img src="${imageUrl(product)}" alt="${product.alt}"></div><div class="detail-copy"><p class="eyebrow">${product.brand}</p><h2>${product.name}</h2><p class="detail-description">${product.description}</p><div class="detail-meta"><div><span>Precio</span><strong>Por confirmar</strong></div><div><span>Disponibilidad</span><strong>Por confirmar</strong></div></div><div class="detail-actions"><button class="button dark" data-add-detail="${product.id}">Añadir a bolsa</button><button class="button outline" data-wish-detail="${product.id}">${state.wishlist.includes(product.id) ? 'Guardado' : 'Favorito'}</button></div></div></div>`;
    if (!$('#productDialog').open) $('#productDialog').showModal();
    document.body.classList.add('locked');
  }

  function openCheckout() {
    closeOverlays();
    $('#checkoutFormStep').hidden = false; $('#confirmation').hidden = true;
    $('#checkoutForm').reset(); $('input[value="pickup"]').checked = true; $('#addressField').hidden = true;
    $('#addressError').textContent = ''; $('#termsError').textContent = ''; $('#address').classList.remove('invalid');
    $('#summaryCount').textContent = `${totalQuantity()} ${totalQuantity() === 1 ? 'artículo' : 'artículos'}`;
    $('#checkoutDialog').showModal(); document.body.classList.add('locked');
  }

  function confirmSimulation(event) {
    event.preventDefault();
    const method = $('input[name="method"]:checked').value;
    const address = $('#address').value.trim();
    const terms = $('#terms').checked;
    $('#addressError').textContent = ''; $('#termsError').textContent = ''; $('#address').classList.remove('invalid');
    let valid = true;
    if (method === 'delivery' && !address) { $('#addressError').textContent = 'Indica una dirección para consultar la entrega.'; $('#address').classList.add('invalid'); valid = false; }
    if (!terms) { $('#termsError').textContent = 'Confirma que entiendes el carácter simulado de esta demo.'; valid = false; }
    if (!valid) return;
    const itemCount = totalQuantity();
    state.lastConfirmation = {method, itemCount, createdAt:new Date().toISOString()};
    saveState();
    $('#checkoutFormStep').hidden = true; $('#confirmation').hidden = false;
    $('#confirmationSummary').innerHTML = `<div class="confirmation-summary"><strong>${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}</strong><br>${method === 'pickup' ? 'Retiro en tienda' : 'Consulta de entrega'}<br>Total: Por confirmar</div>`;
  }

  document.addEventListener('click', event => {
    const wish = event.target.closest('[data-wish]'); if (wish) { event.stopPropagation(); toggleWishlist(wish.dataset.wish); return; }
    const detail = event.target.closest('[data-detail]'); if (detail) { openProduct(detail.dataset.detail); return; }
    const image = event.target.closest('.product-image'); if (image && !event.target.closest('button')) { openProduct(image.closest('.product-card').dataset.id); return; }
    const addDetail = event.target.closest('[data-add-detail]'); if (addDetail) { addToCart(addDetail.dataset.addDetail); return; }
    const wishDetail = event.target.closest('[data-wish-detail]'); if (wishDetail) { toggleWishlist(wishDetail.dataset.wishDetail); openProduct(wishDetail.dataset.wishDetail); return; }
    const qty = event.target.closest('[data-qty]'); if (qty) { changeQuantity(qty.dataset.qty, Number(qty.dataset.change)); return; }
    const remove = event.target.closest('[data-remove]'); if (remove) { removeCart(remove.dataset.remove); return; }
    const wishCart = event.target.closest('[data-wish-cart]'); if (wishCart) { addToCart(wishCart.dataset.wishCart); return; }
    if (event.target.closest('[data-close]') || event.target === $('#backdrop')) closeOverlays();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeOverlays();
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.product-image')) { event.preventDefault(); openProduct(event.target.closest('.product-card').dataset.id); }
  });

  $$('.categories button').forEach(button => button.addEventListener('click', () => {
    $$('.categories button').forEach(btn => btn.classList.remove('active')); button.classList.add('active'); state.category = button.dataset.category; renderProducts();
  }));
  $('#searchToggle').addEventListener('click', () => { const open = $('#searchPanel').classList.toggle('open'); $('#searchToggle').setAttribute('aria-expanded', String(open)); if (open) $('#searchInput').focus(); });
  $('#searchClose').addEventListener('click', () => { $('#searchPanel').classList.remove('open'); $('#searchToggle').setAttribute('aria-expanded','false'); });
  $('#searchInput').addEventListener('input', event => { state.query = event.target.value; renderProducts(); });
  $('#cartToggle').addEventListener('click', () => openDrawer('#cartDrawer'));
  $('#wishlistToggle').addEventListener('click', () => openDrawer('#wishlistDrawer'));
  $('#checkoutButton').addEventListener('click', openCheckout);
  $('#checkoutForm').addEventListener('submit', confirmSimulation);
  $$('input[name="method"]').forEach(input => input.addEventListener('change', () => { $('#addressField').hidden = input.value !== 'delivery' || !input.checked; }));
  $('#finishOrder').addEventListener('click', () => { state.cart = {}; saveState(); closeOverlays(); updateUI(); toast('Simulación finalizada'); });
  $('#eventInquiry').addEventListener('click', () => toast('En una web oficial, esta consulta abriría el canal de la tienda.'));

  loadState(); updateUI();
})();
