const burger = document.querySelector('.burger-menu');
const nav = document.querySelector('.navigation');

if (burger && nav) {
    burger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        burger.classList.toggle('burger-active', isOpen);
        burger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            burger.classList.remove('burger-active');
            burger.setAttribute('aria-expanded', false);
        });
    });
}
