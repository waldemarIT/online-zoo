import { initUserMenu } from '../../src/header/userMenu.js';
import { fetchAnimals, fetchFeedbacks } from '../../src/api/animals.js';
import type { Animal, Feedback } from '../../src/types/index.js';

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
function bindCardClicks(): void {
  document.querySelectorAll<HTMLElement>('.pet-card').forEach((card): void => {
    card.addEventListener('click', (e: MouseEvent): void => {
      if ((e.target as HTMLElement).closest('.live-link')) return;
      const link = card.querySelector<HTMLAnchorElement>('.live-link')?.getAttribute('href');
      if (link) window.location.href = link;
    });
  });
}

bindCardClicks();

// ── Animal page map ────────────────────────────────────────
const ANIMAL_PAGE_MAP: Record<string, string> = {
  panda: '../zoos/panda.html',
  eagle: '../zoos/eagle.html',
  gorilla: '../zoos/gorilla.html',
  lemur: '../zoos/lemur.html',
};

function getAnimalPage(animal: Animal): string {
  const id = animal.id.toLowerCase();
  return ANIMAL_PAGE_MAP[id] ?? '../zoos/panda.html';
}

// ── Render animals from API ────────────────────────────────
function buildAnimalCard(animal: Animal): string {
  const page = getAnimalPage(animal);
  const img = animal.images[0] ?? '../../assets/images/Rectangle 39.png';
  return `
    <div class="pet-card" style="cursor:pointer">
      <div class="card-img">
        <img src="${img}" alt="${animal.name}">
        <div class="pet-tag">${animal.name}</div>
      </div>
      <div class="card-body">
        <h3>${animal.commonName}</h3>
        <p>${animal.description.slice(0, 100)}...</p>
        <a href="${page}" class="live-link">VIEW LIVE CAM <span>➔</span></a>
      </div>
    </div>
  `;
}

async function loadAnimals(): Promise<void> {
  if (!petsGrid) return;
  try {
    const animals = await fetchAnimals();
    if (!animals.length) return;
    petsGrid.innerHTML = animals.map(buildAnimalCard).join('');
    bindCardClicks();
  } catch {
    // API unavailable — keep static HTML cards
  }
}

// ── Render feedbacks from API ──────────────────────────────
function buildFeedbackCard(fb: Feedback): string {
  return `
    <div class="feedback-card">
      <p class="feedback-text">"${fb.text}"</p>
      <div class="feedback-author">
        <strong>${fb.author}</strong>
        <span>${fb.location} · ${fb.date}</span>
      </div>
    </div>
  `;
}

async function loadFeedbacks(): Promise<void> {
  if (!feedbackContainer) return;
  try {
    const feedbacks = await fetchFeedbacks();
    if (!feedbacks.length) return;
    feedbackContainer.innerHTML = feedbacks.map(buildFeedbackCard).join('');
  } catch {
    // API unavailable — keep static HTML testimonials
  }
}

// ── Init ───────────────────────────────────────────────────
void loadAnimals();
void loadFeedbacks();
