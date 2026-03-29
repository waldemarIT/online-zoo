import { initUserMenu } from '../../src/header/userMenu.js';
import { initTheme } from '../../src/theme/theme.js';

initUserMenu();
initTheme();

// ── Types ──────────────────────────────────────────────────
interface Comment {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string;
}

const STORAGE_KEY = 'zoo_visit_comments';

// ── Storage helpers ────────────────────────────────────────
function getComments(): Comment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Comment[]) : [];
  } catch {
    return [];
  }
}

function saveComment(comment: Comment): void {
  const list = getComments();
  list.unshift(comment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ── Star rating ────────────────────────────────────────────
let selectedRating = 0;

const stars = document.querySelectorAll<HTMLButtonElement>('.star');

stars.forEach((star) => {
  star.addEventListener('mouseenter', () => {
    const val = Number(star.dataset['value']);
    highlightStars(val);
  });
  star.addEventListener('mouseleave', () => {
    highlightStars(selectedRating);
  });
  star.addEventListener('click', () => {
    selectedRating = Number(star.dataset['value']);
    highlightStars(selectedRating);
  });
});

function highlightStars(count: number): void {
  stars.forEach((s) => {
    s.classList.toggle('active', Number(s.dataset['value']) <= count);
  });
}

// ── Char counter ───────────────────────────────────────────
const commentText = document.getElementById('commentText') as HTMLTextAreaElement;
const charCount = document.getElementById('charCount') as HTMLElement;

commentText?.addEventListener('input', () => {
  charCount.textContent = `${commentText.value.length} / 500`;
});

// ── Render ─────────────────────────────────────────────────
function renderStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < rating ? 'star-filled' : 'star-empty'}">★</span>`
  ).join('');
}

function buildCommentCard(c: Comment): string {
  return `
    <div class="comment-card">
      <div class="comment-header">
        <div class="comment-author-info">
          <span class="comment-author">${c.name}</span>
          <span class="comment-stars">${renderStars(c.rating)}</span>
        </div>
        <span class="comment-date">${c.date}</span>
      </div>
      <p class="comment-text">${c.text}</p>
    </div>
  `;
}

function renderComments(): void {
  const list = getComments();
  const container = document.getElementById('commentsList') as HTMLElement;
  const empty = document.getElementById('commentsEmpty') as HTMLElement;

  if (list.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  container.innerHTML = list.map(buildCommentCard).join('');
}

// ── Form submit ────────────────────────────────────────────
const form = document.getElementById('commentForm') as HTMLFormElement;
const nameInput = document.getElementById('commentName') as HTMLInputElement;
const nameError = document.getElementById('nameError') as HTMLElement;
const ratingError = document.getElementById('ratingError') as HTMLElement;
const textError = document.getElementById('textError') as HTMLElement;

form?.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  let valid = true;

  nameError.textContent = '';
  ratingError.textContent = '';
  textError.textContent = '';

  if (!nameInput.value.trim()) {
    nameError.textContent = 'Please enter your name';
    valid = false;
  }
  if (selectedRating === 0) {
    ratingError.textContent = 'Please select a rating';
    valid = false;
  }
  if (!commentText.value.trim()) {
    textError.textContent = 'Please enter a comment';
    valid = false;
  }

  if (!valid) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  saveComment({
    id: crypto.randomUUID(),
    name: nameInput.value.trim(),
    text: commentText.value.trim(),
    rating: selectedRating,
    date: dateStr,
  });

  nameInput.value = '';
  commentText.value = '';
  charCount.textContent = '0 / 500';
  selectedRating = 0;
  highlightStars(0);

  renderComments();

  document.getElementById('commentsList')?.scrollIntoView({ behavior: 'smooth' });
});

// ── Init ───────────────────────────────────────────────────
renderComments();
