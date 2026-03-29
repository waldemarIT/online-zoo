// ── Theme toggle (dark / light) ────────────────────────────
const THEME_KEY = 'zoo_theme';

export type Theme = 'light' | 'dark';

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  // Update all toggle buttons on the page
  document.querySelectorAll<HTMLElement>('.theme-toggle-btn').forEach((btn): void => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  });
}

export function initTheme(): void {
  const saved = (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'light';
  applyTheme(saved);

  // Find the static button (must exist in HTML), or create one as fallback
  const existing = document.querySelector<HTMLElement>('.theme-toggle-btn');
  if (!existing) {
    const fallback = document.createElement('button');
    fallback.className = 'theme-toggle-btn';
    fallback.setAttribute('aria-label', 'Toggle dark/light theme');
    document.querySelector<HTMLElement>('.header-container')?.appendChild(fallback);
  }

  // Bind click on the single button (static or fallback)
  const btn = document.querySelector<HTMLElement>('.theme-toggle-btn');
  btn?.addEventListener('click', (): void => {
    const current = (document.documentElement.getAttribute('data-theme') as Theme) ?? 'light';
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}
