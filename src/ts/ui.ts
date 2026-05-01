// =========================================================
// ui.ts — shared UI helpers used across pages
// =========================================================

export function renderStars(rating: number): string {
    const full = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) =>
        `<span class="star ${i < full ? 'star--filled' : 'star--empty'}">★</span>`
    ).join('');
}

export function showToast(message: string): void {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMsg');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.classList.add('toast--visible');
    setTimeout(() => toast.classList.remove('toast--visible'), 2500);
}

export function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}