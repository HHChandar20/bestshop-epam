// =========================================================
// cart.ts — shared cart logic used by catalog + product
// =========================================================
export function getCart() {
    var _a;
    try {
        return JSON.parse((_a = localStorage.getItem('cart')) !== null && _a !== void 0 ? _a : '[]');
    }
    catch (_b) {
        return [];
    }
}
export function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}
export function addToCart(item, qty = 1) {
    const cart = getCart();
    const idx = cart.findIndex((c) => c.id === item.id);
    if (idx > -1) {
        cart[idx].quantity += qty;
    }
    else {
        cart.push(Object.assign(Object.assign({}, item), { quantity: qty }));
    }
    saveCart(cart);
}
export function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
}
export function updateCartCountUI() {
    const el = document.querySelector('#cartCount');
    if (el)
        el.textContent = String(getCartCount());
}
