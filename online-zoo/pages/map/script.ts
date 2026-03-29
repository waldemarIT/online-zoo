import { initUserMenu } from '../../src/header/userMenu.js';
import { initTheme } from '../../src/theme/theme.js';

// ── User menu + Theme ──────────────────────────────────────
initUserMenu();
initTheme();

// ── Burger menu ────────────────────────────────────────────
const burger = document.querySelector<HTMLButtonElement>('.burger-menu');
const nav = document.querySelector<HTMLElement>('.navigation');

if (burger && nav) {
  burger.addEventListener('click', (): void => {
    const isOpen = nav.classList.toggle('nav-open');
    burger.classList.toggle('burger-active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link): void => {
    link.addEventListener('click', (): void => {
      nav.classList.remove('nav-open');
      burger.classList.remove('burger-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}
