// =========================================================
// home.ts — Homepage logic
// =========================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchProducts } from '../services/api.js';
import { addToCart, updateCartCountUI } from '../services/cart.js';
import { showToast } from '../utils/ui.js';
// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        updateCartCountUI();
        let products = [];
        try {
            products = yield fetchProducts();
        }
        catch (err) {
            console.error('Failed to load products:', err);
            return;
        }
        renderSelectedProducts(products);
        renderNewArrivals(products);
        initAddToCartButtons(products);
        initHeroButton();
        initSlider();
    });
}
// ---------------------------------------------------------
// Selected Products (4 on-sale items)
// ---------------------------------------------------------
function renderSelectedProducts(products) {
    const grid = document.getElementById('selectedGrid');
    if (!grid)
        return;
    const saleItems = products.filter((p) => p.salesStatus).slice(0, 4);
    if (saleItems.length === 0)
        return;
    grid.innerHTML = saleItems.map((p) => renderProductCard(p)).join('');
    bindProductCards(grid, products);
}
// ---------------------------------------------------------
// New Arrivals (4 most popular items)
// ---------------------------------------------------------
function renderNewArrivals(products) {
    const grid = document.getElementById('newArrivalsGrid');
    if (!grid)
        return;
    const arrivals = [...products]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 4);
    grid.innerHTML = arrivals.map((p) => renderProductCard(p, 'NEW')).join('');
    bindProductCards(grid, products);
}
// ---------------------------------------------------------
// Card template
// ---------------------------------------------------------
function renderProductCard(p, badgeOverride) {
    const badge = badgeOverride
        ? `<span class="product-card__badge">${badgeOverride}</span>`
        : p.salesStatus
            ? `<span class="product-card__badge">SALE</span>`
            : '';
    return `
        <article class="product-card" data-id="${p.id}" style="cursor:pointer">
        <div class="product-card__img">
            <img src="${p.imageUrl}" alt="${p.name}" loading="lazy">
            ${badge}
        </div>
        <div class="product-card__body">
            <p class="product-card__name">${p.name}</p>
            <p class="product-card__price">$${p.price}</p>
            <button class="btn btn--primary btn--sm" data-id="${p.id}" data-name="${p.name}">Add To Cart</button>
        </div>
        </article>`;
}
function bindProductCards(grid, products) {
    grid.querySelectorAll('.product-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn'))
                return;
            const id = card.dataset.id;
            if (id)
                window.location.href = `html/product.html?id=${id}`;
        });
    });
    grid.querySelectorAll('.btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = products.find((p) => p.id === btn.dataset.id);
            if (!product)
                return;
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
            });
            updateCartCountUI();
            showToast(`${product.name} added to cart!`);
        });
    });
}
function initAddToCartButtons(products) {
    document.querySelectorAll('.btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = products.find((p) => p.id === btn.dataset.id);
            if (!product)
                return;
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
            });
            updateCartCountUI();
            showToast(`${product.name} added to cart!`);
        });
    });
}
function initHeroButton() {
    const btn = document.getElementById('heroBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            window.location.href = 'html/catalog.html';
        });
    }
}
function initSlider() {
    const cards = document.querySelectorAll('.suit-card');
    if (cards.length === 0)
        return;
    let current = 0;
    // Add hover zoom effect to all cards (CSS handles it, but ensure class is present)
    cards.forEach((card) => {
        card.classList.add('reveal', 'visible');
    });
    // Auto-highlight one card at a time every 2.5s
    function highlight() {
        cards.forEach((c) => c.classList.remove('suit-card--active'));
        cards[current].classList.add('suit-card--active');
        current = (current + 1) % cards.length;
    }
    highlight();
    setInterval(highlight, 2500);
}
document.addEventListener('DOMContentLoaded', init);
