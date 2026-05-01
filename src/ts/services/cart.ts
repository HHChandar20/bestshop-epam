// =========================================================
// cart.ts — shared cart logic used by catalog + product
// =========================================================

import type { CartItem } from '../models/types.js';

export function getCart(): CartItem[] {
    try {
        return JSON.parse(localStorage.getItem('cart') ?? '[]');
    } catch {
        return [];
    }
}

export function saveCart(cart: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(item: Omit<CartItem, 'quantity'>, qty = 1): void {
    const cart = getCart();
    const idx = cart.findIndex((c) => c.id === item.id);
    if (idx > -1) {
        cart[idx].quantity += qty;
    } else {
        cart.push({ ...item, quantity: qty });
    }
    saveCart(cart);
}

export function getCartCount(): number {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function updateCartCountUI(): void {
    const el = document.querySelector<HTMLElement>('#cartCount');
    if (el) el.textContent = String(getCartCount());
}