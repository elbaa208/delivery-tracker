/* ═══════════════════════════════════════════
   product.js — Single product detail page
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await getSettings();

  // Get product ID from URL
  const pathParts = window.location.pathname.split('/');
  const productId = pathParts[pathParts.length - 1];

  if (!productId) return;

  const mainImage = document.getElementById('galleryMain');
  const thumbsContainer = document.getElementById('galleryThumbs');

  async function loadProduct() {
    try {
      const [pRes, allRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/products')
      ]);
      const product = await pRes.json();
      if (product.error) { document.body.innerHTML = '<div class="empty-state" style="padding:200px 0"><i class="fas fa-box-open"></i><p>المنتج غير موجود</p></div>'; return; }
      const allProducts = await allRes.json();

      renderProduct(product);
      renderSimilar(allProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4), settings);
    } catch { console.error('Failed to load product'); }
  }

  function renderProduct(p) {
    document.title = `${p.name} — البعقيلي للحجاب`;

    // Name & price
    setText('productName', p.name);
    setText('productNameBreadcrumb', p.name);
    setText('productPrice', `${p.price.toLocaleString('ar-SA')} ر.س`);
    setText('productDesc', p.description || p.shortDescription);
    setText('productMaterial', p.material || '—');
    setText('productCategory', p.category || '—');

    // Availability
    const avail = document.getElementById('productAvail');
    if (avail) { avail.textContent = p.available ? 'متوفر' : 'غير متوفر'; avail.className = `badge badge-${p.available ? 'green' : 'red'}`; }

    // Images
    const images = p.images?.length ? p.images : ['/assets/images/product-placeholder.jpg'];
    if (mainImage) {
      mainImage.src = images[0];
      mainImage.alt = p.name;
    }
    if (thumbsContainer && images.length > 1) {
      thumbsContainer.innerHTML = images.map((img, i) =>
        `<div class="gallery-thumb ${i===0?'active':''}" onclick="switchImage('${img}', this)"><img src="${img}" alt="صورة ${i+1}" loading="lazy" onerror="this.src='/assets/images/product-placeholder.jpg'"></div>`
      ).join('');
    }

    // Colors
    renderOptions('colorsContainer', p.colors, 'color');
    // Sizes
    renderOptions('sizesContainer', p.sizes, 'size');

    // WhatsApp button
    const wa = whatsappUrl(p.name, settings);
    document.querySelectorAll('.product-whatsapp-btn').forEach(btn => {
      btn.href = wa;
    });

    // Wishlist
    const wbtn = document.getElementById('wishlistBtn');
    if (wbtn) {
      wbtn.dataset.wishlistId = p.id;
      wbtn.classList.toggle('active', isWishlisted(p.id));
      wbtn.innerHTML = isWishlisted(p.id) ? '<i class="fas fa-heart"></i> في المفضلة' : '<i class="far fa-heart"></i> أضف للمفضلة';
      wbtn.addEventListener('click', () => {
        const inWishlist = toggleWishlist(p.id);
        wbtn.innerHTML = inWishlist ? '<i class="fas fa-heart"></i> في المفضلة' : '<i class="far fa-heart"></i> أضف للمفضلة';
        wbtn.classList.toggle('active', inWishlist);
      });
    }
  }

  function renderOptions(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container || !items?.length) { container?.closest('.detail-options')?.remove(); return; }
    container.innerHTML = items.map(item =>
      `<div class="option-chip" onclick="selectOption(this, '${type}')">${item}</div>`
    ).join('');
  }

  function renderSimilar(products, s) {
    const container = document.getElementById('similarProducts');
    if (!container) return;
    if (!products.length) { document.getElementById('similarSection')?.remove(); return; }
    container.innerHTML = products.map(p => renderProductCard(p, s)).join('');
  }

  window.switchImage = (src, el) => {
    if (mainImage) { mainImage.src = src; mainImage.style.opacity = '0'; setTimeout(() => mainImage.style.opacity = '1', 50); }
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    el?.classList.add('active');
  };

  window.selectOption = (el, type) => {
    el.closest('.options-list')?.querySelectorAll('.option-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  };

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  await loadProduct();
});
