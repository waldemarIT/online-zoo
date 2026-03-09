import './userMenu.css';
import { getCurrentUser, isLoggedIn, signOut } from '../api/auth.js';
import type { User } from '../types/index.js';

function buildGuestPopup(): string {
  return `
    <ul class="user-popup-list">
      <li><a href="/pages/auth/signin.html" class="user-popup-link">Sign In</a></li>
      <li><a href="/pages/auth/register.html" class="user-popup-link">Registration</a></li>
    </ul>
  `;
}

function buildLoggedInPopup(user: User): string {
  return `
    <div class="user-popup-profile">
      <p class="user-popup-name">${user.name}</p>
      <p class="user-popup-email">${user.email}</p>
    </div>
    <button class="sign-out-btn">Sign Out</button>
  `;
}

function buildUserIcon(user: User | null): string {
  const svgIcon = `
    <svg class="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  const nameSpan = user ? `<span class="user-name">${user.name}</span>` : '';
  return svgIcon + nameSpan;
}

export function initUserMenu(): void {
  const headerContainer = document.querySelector<HTMLElement>('.header-container');
  if (!headerContainer) return;

  const user = getCurrentUser();
  const loggedIn = isLoggedIn();

  // Build elements
  const wrapper = document.createElement('div');
  wrapper.className = 'user-menu-wrapper';

  const btn = document.createElement('button');
  btn.className = 'user-menu-btn';
  btn.setAttribute('aria-label', 'User menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = buildUserIcon(user);

  const popup = document.createElement('div');
  popup.className = 'user-popup';
  popup.hidden = true;
  popup.innerHTML = loggedIn && user
    ? buildLoggedInPopup(user)
    : buildGuestPopup();

  wrapper.appendChild(btn);
  wrapper.appendChild(popup);
  headerContainer.appendChild(wrapper);

  // Toggle popup on button click
  btn.addEventListener('click', (e: MouseEvent): void => {
    e.stopPropagation();
    const isOpen = popup.hidden;
    popup.hidden = !isOpen;
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close popup when clicking outside
  document.addEventListener('click', (): void => {
    popup.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  });

  popup.addEventListener('click', (e: MouseEvent): void => {
    e.stopPropagation();
  });

  // Sign out handler
  const signOutBtn = popup.querySelector<HTMLButtonElement>('.sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', (): void => {
      signOut();
      window.location.reload();
    });
  }
}
