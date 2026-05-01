// =========================================================
// cart.ts — Cart page logic
// =========================================================

import type { CartItem } from '../models/types.js';
import { getCart, saveCart, getCartCount, updateCartCountUI } from '../services/cart.js';
import { showToast } from '../utils/ui.js';

// ---------------------------------------------------------
// Constants
// ---------------------------------------------------------

const SHIPPING_COST = 30;
const DISCOUNT_THRESHOLD = 3000;
const DISCOUNT_RATE = 0.1;

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------

function init(): void {
    updateCartCountUI();
    renderCart();
    bindActions();
}

// ---------------------------------------------------------
// Render
// ---------------------------------------------------------

function renderCart(): void {
    const cart = getCart();
    const emptyEl = document.getElementById('cartEmpty')!;
    const contentEl = document.getElementById('cartContent')!;
    const thankYouEl = document.getElementById('cartThankYou')!;

    // Hide thank-you if we're re-rendering normally
    thankYouEl.style.display = 'none';

    if (cart.length === 0) {
        emptyEl.style.display = 'flex';
        contentEl.style.display = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    contentEl.style.display = 'block';

    renderRows(cart);
    renderSummary(cart);
}

function renderRows(cart: CartItem[]): void {
    const tbody = document.getElementById('cartTableBody')!;

    tbody.innerHTML = cart.map((item) => `
        <tr class="cart-row" data-id="${item.id}">
            <td class="cart-row__img">
                <img src="${item.imageUrl}" alt="${item.name}" />
            </td>
            <td class="cart-row__name">${item.name}</td>
            <td class="cart-row__price">$${item.price}</td>
            <td class="cart-row__qty">
                <div class="cart-qty">
                    <button class="cart-qty__btn cart-qty__minus" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                    <span class="cart-qty__val">${item.quantity}</span>
                    <button class="cart-qty__btn cart-qty__plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
            </td>
            <td class="cart-row__total">$${item.price * item.quantity}</td>
            <td class="cart-row__delete">
                <button class="cart-delete-btn" data-id="${item.id}" aria-label="Remove item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    // Bind row buttons
    tbody.querySelectorAll<HTMLButtonElement>('.cart-qty__minus').forEach((btn) => {
        btn.addEventListener('click', () => changeQty(btn.dataset.id!, -1));
    });
    tbody.querySelectorAll<HTMLButtonElement>('.cart-qty__plus').forEach((btn) => {
        btn.addEventListener('click', () => changeQty(btn.dataset.id!, 1));
    });
    tbody.querySelectorAll<HTMLButtonElement>('.cart-delete-btn').forEach((btn) => {
        btn.addEventListener('click', () => removeItem(btn.dataset.id!));
    });
}

function renderSummary(cart: CartItem[]): void {
    const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountApplied = subTotal >= DISCOUNT_THRESHOLD;
    const discountAmount = discountApplied ? Math.round(subTotal * DISCOUNT_RATE) : 0;
    const discountedSubTotal = subTotal - discountAmount;
    const total = discountedSubTotal + SHIPPING_COST;

    const subTotalEl = document.getElementById('cartSubTotal')!;
    const shippingEl = document.getElementById('cartShipping')!;
    const totalEl = document.getElementById('cartTotal')!;
    const discountRow = document.getElementById('cartDiscountRow')!;
    const discountEl = document.getElementById('cartDiscount')!;

    subTotalEl.textContent = `$${subTotal}`;
    shippingEl.textContent = `$${SHIPPING_COST}`;
    totalEl.textContent = `$${total}`;

    if (discountApplied) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-$${discountAmount}`;
    } else {
        discountRow.style.display = 'none';
    }
}

// ---------------------------------------------------------
// Actions
// ---------------------------------------------------------

function changeQty(id: string, delta: number): void {
    const cart = getCart();
    const idx = cart.findIndex((c) => c.id === id);
    if (idx === -1) return;

    cart[idx].quantity += delta;
    if (cart[idx].quantity < 1) cart[idx].quantity = 1;

    saveCart(cart);
    updateCartCountUI();
    renderRows(cart);
    renderSummary(cart);
}

function removeItem(id: string): void {
    const cart = getCart().filter((c) => c.id !== id);
    saveCart(cart);
    updateCartCountUI();
    showToast('Item removed from cart.');
    renderCart();
}

function clearCart(): void {
    saveCart([]);
    updateCartCountUI();
    renderCart();
    showToast('Cart cleared.');
}

function checkout(): void {
    saveCart([]);
    updateCartCountUI();

    const emptyEl = document.getElementById('cartEmpty')!;
    const contentEl = document.getElementById('cartContent')!;
    const thankYouEl = document.getElementById('cartThankYou')!;

    emptyEl.style.display = 'none';
    contentEl.style.display = 'none';
    thankYouEl.style.display = 'flex';
}

function bindActions(): void {
    document.getElementById('clearCartBtn')?.addEventListener('click', clearCart);
    document.getElementById('checkoutBtn')?.addEventListener('click', checkout);

    // Make cart icon link to cart page (update counter visibility)
    const cartCount = document.getElementById('cartCount')!;
    const count = getCartCount();
    if (count === 0) {
        cartCount.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', init);