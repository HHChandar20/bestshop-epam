// =========================================================
// about.ts — About Us page logic
// =========================================================
import { updateCartCountUI } from '../services/cart.js';
function init() {
    updateCartCountUI();
    initSeeAllModels();
}
function initSeeAllModels() {
    document.querySelectorAll('.see-all-btn, [data-action="see-all-models"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            window.location.href = 'catalog.html';
        });
    });
}
document.addEventListener('DOMContentLoaded', init);
