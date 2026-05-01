// =========================================================
// catalog.ts — Catalog page logic
// =========================================================

import type { SortKey } from '../models/enums.js';
import type { Product } from '../models/types.js';
import { fetchProducts } from '../services/api.js';
import { addToCart, updateCartCountUI } from '../services/cart.js';
import { renderStars, showToast, shuffleArray } from '../ui.js';

// ---------------------------------------------------------
// State
// ---------------------------------------------------------

let allProducts: Product[] = [];
let filteredProducts: Product[] = [];
let currentPage = 1;
let currentSort: SortKey = 'default';
let searchQuery = '';
let urlCategory = '';

const ITEMS_PER_PAGE = 12;

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------

async function init(): Promise<void> {
    readUrlParams();
    initSort();
    initSearch();

    try {
        allProducts = await fetchProducts();
    } catch (err) {
        console.error(err);
        return;
    }

    applyAndRender();
    renderTopBestSets();
    updateCartCountUI();
}

// ---------------------------------------------------------
// URL params
// ---------------------------------------------------------

function readUrlParams(): void {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) urlCategory = cat;
}

// ---------------------------------------------------------
// Filter + sort + render pipeline
// ---------------------------------------------------------

function applyAndRender(): void {
    let result = [...allProducts];

    if (urlCategory) {
        result = result.filter((p) => p.category === urlCategory);
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    result = sortProducts(result);

    filteredProducts = result;
    currentPage = 1;
    renderGrid();
    renderPagination();
    updateResultsCount();
}

// ---------------------------------------------------------
// Sort
// ---------------------------------------------------------

function sortProducts(products: Product[]): Product[] {
    switch (currentSort) {
        case 'price-asc':   return [...products].sort((a, b) => a.price - b.price);
        case 'price-desc':  return [...products].sort((a, b) => b.price - a.price);
        case 'popularity':  return [...products].sort((a, b) => b.popularity - a.popularity);
        case 'rating':      return [...products].sort((a, b) => b.rating - a.rating);
        default:            return products;
    }
}

function initSort(): void {
    const select = document.querySelector<HTMLSelectElement>('.catalog-sort');
    if (!select) return;

    const map: Record<string, SortKey> = {
        'Default Sorting':   'default',
        'Price: Low to High': 'price-asc',
        'Price: High to Low': 'price-desc',
        'Most Popular':      'popularity',
        'Highest Rated':     'rating',
    };

    select.addEventListener('change', () => {
        currentSort = map[select.value] ?? 'default';
        applyAndRender();
    });
}

// ---------------------------------------------------------
// Grid
// ---------------------------------------------------------

function renderGrid(): void {
    const grid = document.querySelector<HTMLElement>('.catalog-grid');
    if (!grid) return;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredProducts.slice(start, start + ITEMS_PER_PAGE);

    if (pageItems.length === 0) {
        grid.innerHTML = `<div class="catalog-empty"><p>No products found.</p></div>`;
        return;
    }

    grid.innerHTML = pageItems.map(renderProductCard).join('');

    grid.querySelectorAll<HTMLElement>('.product-card').forEach((card) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn')) return;
        const id = card.dataset.id;
        if (id) window.location.href = `product.html?id=${id}`;
        });
    });

    grid.querySelectorAll<HTMLButtonElement>('.btn[data-id]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const product = allProducts.find((p) => p.id === btn.dataset.id);
        if (!product) return;
        addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
        updateCartCountUI();
        showToast(`${product.name} added to cart!`);
        });
    });
}

function renderProductCard(p: Product): string {
    const badge = p.salesStatus ? `<span class="product-card__badge">SALE</span>` : '';
    return `
        <article class="product-card" data-id="${p.id}">
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

// ---------------------------------------------------------
// Results count
// ---------------------------------------------------------

function updateResultsCount(): void {
    const el = document.querySelector<HTMLElement>('.catalog-toolbar__results');
    if (!el) return;
    const total = filteredProducts.length;
    const start = Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, total);
    const end = Math.min(currentPage * ITEMS_PER_PAGE, total);
    el.textContent = total === 0 ? 'No results' : `Showing ${start}–${end} Of ${total} Results`;
}

// ---------------------------------------------------------
// Pagination
// ---------------------------------------------------------

function renderPagination(): void {
    const container = document.querySelector<HTMLElement>('.catalog-pagination');
    if (!container) return;

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    container.innerHTML = '';

    const prev = document.createElement('button');
    prev.className = 'pag-nav';
    prev.disabled = currentPage === 1;
    prev.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg> PREV`;
    prev.addEventListener('click', () => goToPage(currentPage - 1));
    container.appendChild(prev);

    const pages = document.createElement('div');
    pages.className = 'pag-pages';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pag-btn' + (i === currentPage ? ' pag-btn--active' : '');
        btn.textContent = String(i);
        btn.addEventListener('click', () => goToPage(i));
        pages.appendChild(btn);
    }
    container.appendChild(pages);

    const next = document.createElement('button');
    next.className = 'pag-nav';
    next.disabled = currentPage === totalPages || totalPages === 0;
    next.innerHTML = `NEXT <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
    next.addEventListener('click', () => goToPage(currentPage + 1));
    container.appendChild(next);
    }

    function goToPage(page: number): void {
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderGrid();
    renderPagination();
    updateResultsCount();
    document.querySelector('.catalog-layout')?.scrollIntoView({ behavior: 'smooth' });
}

// ---------------------------------------------------------
// Search
// ---------------------------------------------------------

function initSearch(): void {
    const input = document.querySelector<HTMLInputElement>('.catalog-search input');
    const btn = document.querySelector<HTMLButtonElement>('.catalog-search button');
    const wrapper = document.querySelector<HTMLElement>('.catalog-search');
    if (!input || !btn || !wrapper) return;

    const dropdown = document.createElement('ul');
    dropdown.className = 'search-dropdown';
    wrapper.appendChild(dropdown);

    const hide = () => {
        dropdown.innerHTML = '';
        dropdown.classList.remove('search-dropdown--visible');
    };

    const show = (matches: Product[], query: string) => {
        dropdown.innerHTML = '';

        if (matches.length === 0) {
        const li = document.createElement('li');
        li.className = 'search-dropdown__item search-dropdown__item--empty';
        li.textContent = `No results for "${query}"`;
        dropdown.appendChild(li);
        } else {
        matches.slice(0, 6).forEach((p) => {
            const li = document.createElement('li');
            li.className = 'search-dropdown__item';
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const highlighted = p.name.replace(regex, '<mark>$1</mark>');
            li.innerHTML = `
            <img src="${p.imageUrl}" alt="${p.name}" class="search-dropdown__img" />
            <div class="search-dropdown__info">
                <span class="search-dropdown__name">${highlighted}</span>
                <span class="search-dropdown__price">$${p.price}</span>
            </div>`;
            li.addEventListener('mousedown', (e) => {
            e.preventDefault();
            window.location.href = `product.html?id=${p.id}`;
            });
            dropdown.appendChild(li);
        });
        }

        dropdown.classList.add('search-dropdown--visible');
    };

    input.addEventListener('input', () => {
        const query = input.value.trim();
        if (!query) { hide(); return; }
        show(allProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), query);
    });

    input.addEventListener('blur', () => setTimeout(hide, 150));
    input.addEventListener('focus', () => {
        const query = input.value.trim();
        if (query) show(allProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), query);
    });

    const runSearch = () => {
        const query = input.value.trim();
        hide();
        if (!query) { searchQuery = ''; applyAndRender(); return; }

        const exact = allProducts.find((p) => p.name.toLowerCase() === query.toLowerCase());
        if (exact) { window.location.href = `product.html?id=${exact.id}`; return; }

        const partial = allProducts.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
        if (partial.length > 0) {
        searchQuery = query;
        applyAndRender();
        } else {
        searchQuery = '';
        showNotFoundPopup(query);
        }
    };

    btn.addEventListener('click', runSearch);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runSearch();
        if (e.key === 'Escape') hide();
    });
}

function showNotFoundPopup(query: string): void {
    document.getElementById('search-not-found-popup')?.remove();
    const popup = document.createElement('div');
    popup.id = 'search-not-found-popup';
    popup.className = 'search-popup';
    popup.innerHTML = `
        <div class="search-popup__content">
        <p>No product found for <strong>"${query}"</strong>.</p>
        <button class="search-popup__close btn btn--primary btn--sm">Close</button>
        </div>`;
    document.body.appendChild(popup);
    popup.querySelector('.search-popup__close')?.addEventListener('click', () => popup.remove());
    setTimeout(() => popup.remove(), 3000);
}

// ---------------------------------------------------------
// Sidebar: Top Best Sets
// ---------------------------------------------------------

function renderTopBestSets(): void {
    const sidebar = document.querySelector<HTMLElement>('.catalog-sidebar');
    if (!sidebar) return;

    const sets = allProducts.filter((p) => p.category === 'luggage sets');
    const pool = sets.length > 0 ? sets : allProducts;
    const picked = shuffleArray(pool).slice(0, 5);

    sidebar.querySelectorAll('.sidebar-item').forEach((el) => el.remove());

    picked.forEach((p) => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerHTML = `
        <div class="sidebar-item__img">
            <img src="${p.imageUrl}" alt="${p.name}" loading="lazy"/>
        </div>
        <div class="sidebar-item__info">
            <p class="sidebar-item__name">${p.name}</p>
            <div class="sidebar-item__stars">${renderStars(p.rating)}</div>
            <p class="sidebar-item__price">$${p.price}</p>
        </div>`;
        item.addEventListener('click', () => { window.location.href = `product.html?id=${p.id}`; });
        sidebar.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', init);