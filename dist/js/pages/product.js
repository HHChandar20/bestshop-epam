// =========================================================
// product.ts — Product detail page logic
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
import { fetchProducts, fetchReviews } from '../services/api.js';
import { addToCart, updateCartCountUI } from '../services/cart.js';
import { renderStars, showToast, shuffleArray } from '../utils/ui.js';
// ---------------------------------------------------------
// State
// ---------------------------------------------------------
let currentProduct = null;
let allProducts = [];
let allReviews = [];
let quantity = 1;
// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        initQuantity();
        initTabs();
        updateCartCountUI();
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        try {
            const [products, reviews] = yield Promise.all([
                fetchProducts(),
                fetchReviews(),
            ]);
            const localReviews = JSON.parse((_a = localStorage.getItem('reviews')) !== null && _a !== void 0 ? _a : '[]');
            // Deduplicate: exclude local reviews whose ID already exists in the API response
            const apiIds = new Set(reviews.map((r) => r.id));
            const uniqueLocalReviews = localReviews.filter((r) => !apiIds.has(r.id));
            allProducts = products;
            allReviews = [...reviews, ...uniqueLocalReviews];
        }
        catch (err) {
            showError('Failed to load products.');
            return;
        }
        if (!id) {
            showError('No product ID provided.');
            return;
        }
        const product = allProducts.find((p) => p.id === id);
        if (!product) {
            showError('Product not found.');
            return;
        }
        currentProduct = product;
        renderProduct(product);
        renderReviews(product.id);
        initReviewForm(product.id);
        renderRelated(product);
        initCartButton();
    });
}
// ---------------------------------------------------------
// Render: product
// ---------------------------------------------------------
function renderProduct(p) {
    document.title = `${p.name} — Best Shop`;
    const imgElement = document.querySelector('.product-detail__img img');
    if (imgElement) {
        imgElement.src = p.imageUrl;
        imgElement.alt = p.name;
    }
    const badge = document.querySelector('.product-detail__badge');
    if (badge)
        badge.style.display = p.salesStatus ? 'inline-block' : 'none';
    const nameElement = document.querySelector('.product-detail__name');
    if (nameElement)
        nameElement.textContent = p.name;
    const priceElement = document.querySelector('.product-detail__price');
    if (priceElement)
        priceElement.textContent = `$${p.price}`;
    const starsElement = document.querySelector('.product-detail__stars');
    if (starsElement)
        starsElement.innerHTML = renderStars(p.rating);
    const reviewProductName = document.querySelector('.reviews-section__product-name');
    if (reviewProductName)
        reviewProductName.textContent = p.name;
    renderThumbnails(p);
    populateSelect('sizeSelect', p.size.split(',').map((s) => s.trim()), p.size.split(',')[0].trim());
    populateSelect('colorSelect', [p.color], p.color);
    populateSelect('categorySelect', [p.category], p.category);
}
function renderThumbnails(p) {
    const thumbsElement = document.getElementById('thumbnails');
    const imgElement = document.querySelector('.product-detail__img img');
    if (!thumbsElement || !imgElement)
        return;
    thumbsElement.innerHTML = '';
    [p.imageUrl, p.imageUrl, p.imageUrl, p.imageUrl].forEach((src, i) => {
        const div = document.createElement('div');
        div.className = 'product-detail__thumb' + (i === 0 ? ' product-detail__thumb--active' : '');
        div.innerHTML = `<img src="${src}" alt="${p.name} angle ${i + 1}" />`;
        div.addEventListener('click', () => {
            imgElement.src = src;
            thumbsElement.querySelectorAll('.product-detail__thumb').forEach((t) => t.classList.remove('product-detail__thumb--active'));
            div.classList.add('product-detail__thumb--active');
        });
        thumbsElement.appendChild(div);
    });
}
function renderReviews(productId) {
    const container = document.getElementById('reviewsList');
    if (!container)
        return;
    const reviews = allReviews.filter((r) => r.productId === productId);
    const count = document.getElementById('reviewsCount');
    if (count)
        count.textContent = String(reviews.length);
    if (reviews.length === 0) {
        container.innerHTML = `<p class="reviews-empty">No reviews yet.</p>`;
        return;
    }
    container.innerHTML = reviews.map((r) => `
        <article class="review-card">
        <div class="review-card__avatar">
            ${r.username.charAt(0).toUpperCase()}
        </div>
        <div class="review-card__content">
            <div class="review-card__top">
            <div class="review-card__meta">
                ${r.username}
                <span>/ ${new Date(r.date).toLocaleDateString()}</span>
            </div>
            <div class="review-card__stars">
                ${renderStars(r.rating)}
            </div>
            </div>
            <p class="review-card__comment">${r.comment}</p>
        </div>
        </article>
    `).join('');
}
function populateSelect(id, options, selected) {
    const select = document.getElementById(id);
    if (!select)
        return;
    select.innerHTML = options.map((opt) => `<option value="${opt}" ${opt === selected ? 'selected' : ''}>${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`).join('');
}
// ---------------------------------------------------------
// Render: related products
// ---------------------------------------------------------
function renderRelated(p) {
    var _a;
    const grid = document.getElementById('relatedGrid');
    if (!grid)
        return;
    const related = shuffleArray(allProducts.filter((r) => r.category === p.category && r.id !== p.id)).slice(0, 4);
    if (related.length === 0) {
        (_a = grid.closest('.product-related')) === null || _a === void 0 ? void 0 : _a.remove();
        return;
    }
    grid.innerHTML = related.map((r) => {
        const badge = r.salesStatus ? `<span class="product-card__badge">SALE</span>` : '';
        return `
        <article class="product-card" data-id="${r.id}" style="cursor:pointer">
            <div class="product-card__img">
            <img src="${r.imageUrl}" alt="${r.name}" loading="lazy">
            ${badge}
            </div>
            <div class="product-card__body">
            <p class="product-card__name">${r.name}</p>
            <p class="product-card__price">$${r.price}</p>
            <button class="btn btn--primary btn--sm" data-id="${r.id}">Add To Cart</button>
            </div>
        </article>`;
    }).join('');
    grid.querySelectorAll('.product-card').forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.btn'))
                return;
            const id = card.dataset.id;
            if (id)
                window.location.href = `product.html?id=${id}`;
        });
    });
    grid.querySelectorAll('.btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = allProducts.find((p) => p.id === btn.dataset.id);
            if (!product)
                return;
            addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
            updateCartCountUI();
            showToast(`${product.name} added to cart!`);
        });
    });
}
// ---------------------------------------------------------
// Quantity
// ---------------------------------------------------------
function initQuantity() {
    const minus = document.getElementById('qtyMinus');
    const plus = document.getElementById('qtyPlus');
    const val = document.getElementById('qtyValue');
    if (!minus || !plus || !val)
        return;
    minus.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            val.textContent = String(quantity);
        }
    });
    plus.addEventListener('click', () => {
        quantity++;
        val.textContent = String(quantity);
    });
}
// ---------------------------------------------------------
// Tabs
// ---------------------------------------------------------
function initTabs() {
    const btns = document.querySelectorAll('.product-tabs__btn');
    const panels = document.querySelectorAll('.product-tabs__panel');
    btns.forEach((btn) => {
        btn.addEventListener('click', () => {
            var _a;
            btns.forEach((b) => b.classList.remove('product-tabs__btn--active'));
            panels.forEach((p) => p.classList.remove('product-tabs__panel--active'));
            btn.classList.add('product-tabs__btn--active');
            (_a = document.getElementById(`tab-${btn.dataset.tab}`)) === null || _a === void 0 ? void 0 : _a.classList.add('product-tabs__panel--active');
        });
    });
}
// ---------------------------------------------------------
// Cart
// ---------------------------------------------------------
function initCartButton() {
    const btn = document.querySelector('.product-detail__cart-btn');
    if (!btn)
        return;
    btn.addEventListener('click', () => {
        if (!currentProduct)
            return;
        addToCart({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            imageUrl: currentProduct.imageUrl,
        }, quantity);
        updateCartCountUI();
        showToast(`${currentProduct.name} added to cart!`);
    });
}
// ---------------------------------------------------------
// Review Form
// ---------------------------------------------------------
function initReviewForm(productId) {
    const form = document.getElementById('reviewForm');
    if (!form)
        return;
    // --- Star rating wiring ---
    const ratingInput = document.getElementById('ratingInput');
    const starContainer = document.getElementById('starRating');
    const stars = document.querySelectorAll('.star-rating__star');
    let selectedRating = 0;
    function updateStars(fillUpTo, isSelected = false) {
        stars.forEach((s) => {
            const sv = Number(s.dataset.value);
            const filled = sv <= fillUpTo;
            s.textContent = filled ? '★' : '☆';
            s.classList.toggle('is-selected', isSelected && sv <= selectedRating);
            s.classList.toggle('is-hovered', !isSelected && filled);
        });
    }
    // Mouse leave on the container resets to selected state
    starContainer === null || starContainer === void 0 ? void 0 : starContainer.addEventListener('mouseleave', () => {
        updateStars(selectedRating, true);
    });
    stars.forEach((star) => {
        const val = Number(star.dataset.value);
        star.addEventListener('mouseenter', () => {
            updateStars(val, false);
        });
        star.addEventListener('click', () => {
            selectedRating = val;
            ratingInput.value = String(val);
            updateStars(selectedRating, true);
        });
    });
    // --- Form submit ---
    form.addEventListener('submit', (e) => {
        var _a;
        e.preventDefault();
        const formData = new FormData(form);
        const username = String(formData.get('username') || '').trim();
        const comment = String(formData.get('comment') || '').trim();
        const rating = Number(ratingInput.value);
        if (!username || !comment || !rating)
            return;
        const review = {
            id: crypto.randomUUID(),
            productId,
            username,
            comment,
            rating,
            date: new Date().toISOString(),
        };
        // Only save user-submitted reviews to localStorage (never API reviews)
        const existingLocal = JSON.parse((_a = localStorage.getItem('reviews')) !== null && _a !== void 0 ? _a : '[]');
        existingLocal.unshift(review);
        localStorage.setItem('reviews', JSON.stringify(existingLocal));
        // Update in-memory list and re-render
        allReviews.unshift(review);
        renderReviews(productId);
        // Reset form and stars
        form.reset();
        selectedRating = 0;
        ratingInput.value = '';
        stars.forEach((s) => {
            s.classList.remove('is-selected', 'is-hovered');
            s.textContent = '☆';
        });
        showToast('Review submitted!');
    });
}
// ---------------------------------------------------------
// Error
// ---------------------------------------------------------
function showError(message) {
    const section = document.querySelector('.product-detail');
    if (section) {
        section.innerHTML = `
        <div class="product-detail__error">
            <p>${message}</p>
            <a href="catalog.html" class="btn btn--primary btn--sm">Back to Catalog</a>
        </div>`;
    }
}
// ---------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', init);
