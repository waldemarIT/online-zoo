import { initUserMenu } from '../../src/header/userMenu.js';
import { initTheme } from '../../src/theme/theme.js';
import { getFavourites, toggleFavourite } from '../../src/favourites/favourites.js';
import type { FavouriteAnimal } from '../../src/favourites/favourites.js';

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
  document.addEventListener('click', (e: MouseEvent): void => {
    if (!burger.contains(e.target as Node) && !nav.contains(e.target as Node)) {
      nav.classList.remove('nav-open');
      burger.classList.remove('burger-active');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}


const grid = document.getElementById('favouritesGrid') as HTMLElement;
const empty = document.getElementById('favouritesEmpty') as HTMLElement;

function buildCard(animal: FavouriteAnimal): string {
  return `
    <div class="fav-card">
      <div class="fav-card-img">
        <img src="${animal.image}" alt="${animal.title}">
      </div>
      <div class="fav-card-body">
        <h3>${animal.title}</h3>
        <p class="fav-name">${animal.name}</p>
        <div class="fav-card-actions">
          <a href="../zoos/${animal.page}" class="btn-watch">WATCH LIVE <span>➔</span></a>
          <button class="btn-remove" data-id="${animal.id}" aria-label="Remove from favourites">✕ REMOVE</button>
        </div>
      </div>
    </div>
  `;
}

function render(): void {
  const list = getFavourites();
  if (list.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  empty.style.display = 'none';
  grid.innerHTML = list.map(buildCard).join('');

  grid.querySelectorAll<HTMLButtonElement>('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset['id'];
      if (!id) return;
      const animal = getFavourites().find(a => a.id === id);
      if (animal) toggleFavourite(animal);
      render();
    });
  });
}

render();
