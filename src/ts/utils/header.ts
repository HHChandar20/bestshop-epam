const hamburger = document.getElementById('hamburger') as HTMLButtonElement;
const navLinks = document.querySelector('.nav__links') as HTMLUListElement;
const navClose = document.getElementById('navClose') as HTMLButtonElement;

function openMenu(): void {
    navLinks.classList.add('open');
    hamburger.classList.add('is-open');
}

function closeMenu(): void {
    navLinks.classList.remove('open');
    hamburger.classList.remove('is-open');
    document.querySelectorAll('.nav__item--dropdown.open').forEach(item => {
        item.classList.remove('open');
    });
}

hamburger?.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
});

navClose?.addEventListener('click', closeMenu);

navLinks?.querySelectorAll('a').forEach((link: Element) => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            if (link.closest('.nav__item--dropdown')) return;
            closeMenu();
        }
    });
});

document.querySelectorAll('.nav__item--dropdown').forEach((item: Element) => {
    item.querySelector('.nav__link')?.addEventListener('click', (e: Event) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            item.classList.toggle('open');
        }
    });
});