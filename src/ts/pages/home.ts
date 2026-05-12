import { fetchProducts, fetchReviews } from '../services/api.js';
import { addToCart, updateCartCountUI } from '../services/cart.js';
import { showToast } from '../utils/ui.js';
import type { Product } from '../models/types.js';
import type { Review } from '../models/types.js';

async function init(): Promise<void> {
    updateCartCountUI();

    let products: Product[] = [];
    let reviews: Review[] = [];

    try {
        [products, reviews] = await Promise.all([fetchProducts(), fetchReviews()]);
    } catch (err) {
        console.error('Failed to load data:', err);
        return;
    }

    renderSelectedProducts(products);
    renderNewArrivals(products);
    renderTestimonials(reviews, products);
    initAddToCartButtons(products);
    initHeroButton();
    initSlider();
}

function renderSelectedProducts(products: Product[]): void {
    const grid = document.getElementById('selectedGrid');
    if (!grid) return;

    const saleItems = products.filter((p) => p.salesStatus).slice(0, 4);
    if (saleItems.length === 0) return;

    grid.innerHTML = saleItems.map((p) => renderProductCard(p)).join('');
    bindProductCards(grid, products);
}

function renderNewArrivals(products: Product[]): void {
    const grid = document.getElementById('newArrivalsGrid');
    if (!grid) return;

    const arrivals = [...products]
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 4);

    grid.innerHTML = arrivals.map((p) => renderProductCard(p, 'NEW')).join('');
    bindProductCards(grid, products);
}

function renderTestimonials(reviews: Review[], products: Product[]): void {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;

    // Pick the 3 most recent reviews
    const recent = [...reviews]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    if (recent.length === 0) return;

    grid.innerHTML = recent.map((r) => {
        const product = products.find((p) => p.id === r.productId);
        const initial = r.username.charAt(0).toUpperCase();
        const stars = Array.from({ length: 5 }, (_, i) =>
            `<span style="color:${i < r.rating ? '#f59e0b' : '#d1d5db'}">★</span>`
        ).join('');

        return `
            <article class="testimonial-card">
                <div class="testimonial-card__avatar testimonial-card__avatar--initial">
                    ${initial}
                </div>
                <div class="testimonial-card__header">${r.username}</div>
                <div>${stars}</div>
                <p class="testimonial-card__text">${r.comment}</p>
                <p class="testimonial-card__name">${product ? ` — ${product.name}` : ''}</p>
            </article>`;
    }).join('');
}

function renderProductCard(p: Product, badgeOverride?: string): string {
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

function bindProductCards(grid: HTMLElement, products: Product[]): void {
    grid.querySelectorAll<HTMLElement>('.product-card').forEach((card) => {
        card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn')) return;
        const id = card.dataset.id;
        if (id) window.location.href = `html/product.html?id=${id}`;
        });
    });

    grid.querySelectorAll<HTMLButtonElement>('.btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = products.find((p) => p.id === btn.dataset.id);
        if (!product) return;
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


function initAddToCartButtons(products: Product[]): void {
    document.querySelectorAll<HTMLButtonElement>('.btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = products.find((p) => p.id === btn.dataset.id);
        if (!product) return;
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


function initHeroButton(): void {
    const btn = document.getElementById('heroBtn');
    if (btn) {
        btn.addEventListener('click', () => {
        window.location.href = 'html/catalog.html';
        });
    }
}


function initSlider(): void {
    const cards = document.querySelectorAll<HTMLElement>('.suit-card');
    if (cards.length === 0) return;

    let current = 0;

    cards.forEach((card) => {
        card.classList.add('reveal', 'visible');
    });

    function highlight(): void {
        cards.forEach((c) => c.classList.remove('suit-card--active'));
        cards[current].classList.add('suit-card--active');
        current = (current + 1) % cards.length;
    }

    highlight();
    setInterval(highlight, 2500);
}

document.addEventListener('DOMContentLoaded', init);