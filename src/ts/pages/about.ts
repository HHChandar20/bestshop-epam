import { updateCartCountUI } from '../services/cart.js';

function init(): void {
    updateCartCountUI();
    initSeeAllModels();
}

function initSeeAllModels(): void {
    document.querySelectorAll<HTMLElement>('.see-all-btn, [data-action="see-all-models"]').forEach((btn) => {
        btn.addEventListener('click', () => {
        window.location.href = 'catalog.html';
        });
    });
}

document.addEventListener('DOMContentLoaded', init);