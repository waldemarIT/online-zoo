import { initUserMenu } from '../../src/header/userMenu.js';

// ── User menu ──────────────────────────────────────────────
initUserMenu();

// ── Pet slider ─────────────────────────────────────────────
const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
const track = document.getElementById('sliderTrack') as HTMLElement | null;
const petsGrid = track?.querySelector<HTMLElement>('.pets-grid') ?? null;

function goNext(): void {
  if (!petsGrid || petsGrid.children.length < 2) return;
  const firstCard = petsGrid.firstElementChild;
  if (firstCard) petsGrid.appendChild(firstCard);
}

function goPrev(): void {
  if (!petsGrid || petsGrid.children.length < 2) return;
  const lastCard = petsGrid.lastElementChild;
  if (lastCard) petsGrid.insertBefore(lastCard, petsGrid.firstElementChild);
}

nextBtn?.addEventListener('click', goNext);
prevBtn?.addEventListener('click', goPrev);

// ── Testimonials slider ────────────────────────────────────
const testimonialPrev = document.getElementById('testimonialPrev') as HTMLButtonElement | null;
const testimonialNext = document.getElementById('testimonialNext') as HTMLButtonElement | null;
const feedbackContainer = document.querySelector<HTMLElement>('.feedback-grid');

function nextFeedback(): void {
  if (!feedbackContainer || feedbackContainer.children.length < 2) return;
  feedbackContainer.style.opacity = '0.5';
  setTimeout((): void => {
    const first = feedbackContainer.firstElementChild;
    if (first) feedbackContainer.appendChild(first);
    feedbackContainer.style.opacity = '1';
  }, 200);
}

function prevFeedback(): void {
  if (!feedbackContainer || feedbackContainer.children.length < 2) return;
  feedbackContainer.style.opacity = '0.5';
  setTimeout((): void => {
    const last = feedbackContainer.lastElementChild;
    if (last) feedbackContainer.insertBefore(last, feedbackContainer.firstElementChild);
    feedbackContainer.style.opacity = '1';
  }, 200);
}

testimonialNext?.addEventListener('click', nextFeedback);
testimonialPrev?.addEventListener('click', prevFeedback);

// ── Pet card click navigation ──────────────────────────────
document.querySelectorAll<HTMLElement>('.pet-card').forEach((card): void => {
  card.addEventListener('click', (e: MouseEvent): void => {
    if ((e.target as HTMLElement).closest('.live-link')) return;
    const link = card.querySelector<HTMLAnchorElement>('.live-link')?.getAttribute('href');
    if (link) window.location.href = link;
  });
});
