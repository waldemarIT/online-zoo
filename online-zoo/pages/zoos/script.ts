import { initUserMenu } from '../../src/header/userMenu.js';

// ── User menu ──────────────────────────────────────────────
initUserMenu();

// ── Side panel toggle ──────────────────────────────────────
const sidePanel = document.getElementById('sidePanel') as HTMLElement | null;
const toggleSide = document.getElementById('toggleSide') as HTMLButtonElement | null;
const toggleIcon = document.getElementById('toggleIcon') as HTMLImageElement | null;

const ICON_OPEN = '../../assets/images/Group 17.png';
const ICON_CLOSED = '../../assets/images/Group 17 (1).png';

if (toggleSide && sidePanel) {
  toggleSide.addEventListener('click', (): void => {
    sidePanel.classList.toggle('collapsed');
    const isCollapsed = sidePanel.classList.contains('collapsed');
    if (toggleIcon) {
      toggleIcon.src = isCollapsed ? ICON_CLOSED : ICON_OPEN;
    }
  });
}

// ── Donation modal (3-step) ────────────────────────────────
const donateBtn = document.getElementById('donateBtn') as HTMLButtonElement | null;
const donateModal = document.getElementById('donateModal') as HTMLElement | null;
const modalClose = document.getElementById('modalClose') as HTMLButtonElement | null;

function showStep(n: number): void {
  document.querySelectorAll<HTMLElement>('.modal-step').forEach((s): void => {
    s.classList.remove('active');
  });
  document.getElementById(`step-${n}`)?.classList.add('active');
}

if (donateBtn && donateModal && modalClose) {
  donateBtn.addEventListener('click', (): void => {
    showStep(0);
    const hdr = document.getElementById('modalHeaderBar');
    if (hdr) hdr.style.display = 'none';
    donateModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  modalClose.addEventListener('click', (): void => {
    donateModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  donateModal.addEventListener('click', (e: MouseEvent): void => {
    const target = e.target as HTMLElement;

    if (target === donateModal) {
      donateModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (target.classList.contains('hero-amount')) {
      const hdr = document.getElementById('modalHeaderBar');
      if (hdr) hdr.style.display = 'block';
      showStep(1);
    }

    if (target.classList.contains('btn-next-step')) {
      const next = (target as HTMLButtonElement).dataset['next'];
      if (next) showStep(Number(next));
    }

    if (target.classList.contains('btn-back-step')) {
      const back = (target as HTMLButtonElement).dataset['back'];
      if (back) showStep(Number(back));
    }

    if (target.classList.contains('btn-complete')) {
      donateModal.classList.remove('active');
      document.body.style.overflow = '';
      alert('Thank you for your donation!');
    }

    if (target.classList.contains('amount-btn')) {
      donateModal.querySelectorAll<HTMLButtonElement>('.amount-btn').forEach((b): void => {
        b.classList.remove('selected');
      });
      target.classList.add('selected');
    }
  });
}

// ── Click-to-play YouTube video ────────────────────────────
document.querySelectorAll<HTMLElement>('.main-cam[data-video]').forEach((cam): void => {
  const playBtn = cam.querySelector<HTMLButtonElement>('.play-btn');
  if (!playBtn) return;

  playBtn.addEventListener('click', (): void => {
    const videoId = cam.dataset['video'];
    const label = cam.querySelector<HTMLElement>('.cam-label');
    const labelText = label?.textContent ?? '';

    cam.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
        title="${labelText}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>`;
  });
});
