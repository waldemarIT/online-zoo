import { initUserMenu } from '../../src/header/userMenu.js';
import { fetchAnimalById } from '../../src/api/animals.js';
import { apiPost } from '../../src/api/client.js';
import type { Animal, DonationPayload, DonationResponse, SavedCard } from '../../src/types/index.js';
import { LocalStorageKey } from '../../src/types/index.js';

// ── User menu ──────────────────────────────────────────────
initUserMenu();

// ── Detect current animal ID from URL ─────────────────────
function getAnimalIdFromUrl(): string {
  const filename = window.location.pathname.split('/').pop() ?? '';
  return filename.replace('.html', '');
}

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

// ── Load animal data from API ──────────────────────────────
async function loadAnimalData(animalId: string): Promise<Animal | null> {
  try {
    return await fetchAnimalById(animalId);
  } catch {
    return null;
  }
}

function updateAnimalPage(animal: Animal): void {
  // Did you know?
  const didKnowEl = document.querySelector<HTMLElement>('.did-card p');
  if (didKnowEl && animal.funFact) {
    didKnowEl.textContent = animal.funFact;
  }

  // Details list
  const detailsList = document.querySelector<HTMLElement>('.details-list');
  if (detailsList) {
    const viewMapLink = detailsList.querySelector<HTMLAnchorElement>('a');
    const mapHref = viewMapLink?.getAttribute('href') ?? '../map/index.html';

    detailsList.innerHTML = `
      <p><strong>Common name:</strong> ${animal.commonName}</p>
      <p><strong>Scientific name:</strong> ${animal.scientificName}</p>
      <p><strong>Type:</strong> ${animal.type}</p>
      <p><strong>Size:</strong> ${animal.size}</p>
      <p><strong>Diet:</strong> ${animal.diet}</p>
      <p><strong>Habitat:</strong> ${animal.habitat}</p>
      <p><strong>Range:</strong> ${animal.range} <a href="${mapHref}">VIEW MAP <span>➔</span></a></p>
    `;
  }

  // Main description
  const descEl = document.querySelector<HTMLElement>('.details-text');
  if (descEl && animal.description) {
    descEl.textContent = animal.description;
  }
}

void loadAnimalData(getAnimalIdFromUrl()).then((animal): void => {
  if (animal) updateAnimalPage(animal);
});

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

// ── Saved card helpers ─────────────────────────────────────
function getSavedCards(): SavedCard[] {
  try {
    const raw = localStorage.getItem(LocalStorageKey.SavedCards);
    return raw ? (JSON.parse(raw) as SavedCard[]) : [];
  } catch {
    return [];
  }
}

function saveCard(card: SavedCard): void {
  const cards = getSavedCards();
  const exists = cards.some((c): boolean => c.cardNumber === card.cardNumber);
  if (!exists) {
    cards.push(card);
    localStorage.setItem(LocalStorageKey.SavedCards, JSON.stringify(cards));
  }
}

function prefillSavedCard(): void {
  const cards = getSavedCards();
  if (!cards.length) return;
  const last = cards[cards.length - 1];

  const cardInput = document.querySelector<HTMLInputElement>('input[placeholder=""]');
  const cvvInput = document.querySelectorAll<HTMLInputElement>('input[placeholder=""]')[1];

  if (cardInput) cardInput.value = last.cardNumber;
  if (cvvInput) cvvInput.value = last.cvv;

  // Set expiry selects
  const [month, year] = last.expirationDate.split('/');
  const expirySelects = document.querySelectorAll<HTMLSelectElement>('.expiry-select');
  if (expirySelects[0] && month) expirySelects[0].value = month;
  if (expirySelects[1] && year) expirySelects[1].value = year;
}

// ── Billing validation ────────────────────────────────────
function validateBilling(): boolean {
  const nameInput = document.querySelector<HTMLInputElement>('#step-2 input[type="text"]');
  const emailInput = document.querySelector<HTMLInputElement>('#step-2 input[type="email"]');

  if (!nameInput?.value.trim()) {
    alert('Please enter your name.');
    return false;
  }
  if (!emailInput?.value.trim() || !emailInput.value.includes('@')) {
    alert('Please enter a valid email address.');
    return false;
  }
  return true;
}

// ── Payment validation ────────────────────────────────────
function validatePayment(): boolean {
  const paymentInputs = document.querySelectorAll<HTMLInputElement>('#step-3 input[type="text"]');
  const cardInput = paymentInputs[0];
  const cvvInput = paymentInputs[1];
  const expirySelects = document.querySelectorAll<HTMLSelectElement>('.expiry-select');

  if (!cardInput?.value.trim() || cardInput.value.replace(/\s/g, '').length < 12) {
    alert('Please enter a valid card number.');
    return false;
  }
  if (!cvvInput?.value.trim() || cvvInput.value.length < 3) {
    alert('Please enter a valid CVV.');
    return false;
  }
  if (!expirySelects[0]?.value || !expirySelects[1]?.value) {
    alert('Please select expiration date.');
    return false;
  }
  return true;
}

// ── Submit donation ────────────────────────────────────────
async function submitDonation(): Promise<void> {
  const selectedAmount = donateModal?.querySelector<HTMLButtonElement>('.amount-btn.selected');
  const otherInput = donateModal?.querySelector<HTMLInputElement>('.other-input');
  const petSelect = donateModal?.querySelector<HTMLSelectElement>('.pet-select');
  const monthlyCheck = donateModal?.querySelector<HTMLInputElement>('input[type="checkbox"]');
  const nameInput = document.querySelector<HTMLInputElement>('#step-2 input[type="text"]');
  const emailInput = document.querySelector<HTMLInputElement>('#step-2 input[type="email"]');
  const paymentInputs = document.querySelectorAll<HTMLInputElement>('#step-3 input[type="text"]');
  const expirySelects = document.querySelectorAll<HTMLSelectElement>('.expiry-select');

  const amountStr = selectedAmount?.textContent?.replace('$', '') ?? otherInput?.value ?? '0';
  const amount = parseFloat(amountStr) || 0;
  const cardNumber = paymentInputs[0]?.value.trim() ?? '';
  const cvv = paymentInputs[1]?.value.trim() ?? '';
  const expirationDate = `${expirySelects[0]?.value ?? ''}/${expirySelects[1]?.value ?? ''}`;

  // Save card to localStorage
  saveCard({
    id: Date.now().toString(),
    cardNumber,
    cvv,
    expirationDate,
    label: `**** ${cardNumber.slice(-4)}`,
  });

  const payload: DonationPayload = {
    amount,
    petId: getAnimalIdFromUrl(),
    petName: petSelect?.value ?? '',
    name: nameInput?.value.trim() ?? '',
    email: emailInput?.value.trim() ?? '',
    cardNumber,
    cvv,
    expirationDate,
    monthly: monthlyCheck?.checked ?? false,
  };

  try {
    await apiPost<DonationPayload, DonationResponse>('/donations', payload);
  } catch {
    // API unavailable — still show success to user
  }
}

if (donateBtn && donateModal && modalClose) {
  donateBtn.addEventListener('click', (): void => {
    showStep(0);
    const hdr = document.getElementById('modalHeaderBar');
    if (hdr) hdr.style.display = 'none';
    donateModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    prefillSavedCard();
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
      if (!next) return;

      // Validate step 2 (billing) before going to step 3
      if (next === '3' && !validateBilling()) return;

      showStep(Number(next));
    }

    if (target.classList.contains('btn-back-step')) {
      const back = (target as HTMLButtonElement).dataset['back'];
      if (back) showStep(Number(back));
    }

    if (target.classList.contains('btn-complete')) {
      if (!validatePayment()) return;

      void submitDonation().then((): void => {
        donateModal.classList.remove('active');
        document.body.style.overflow = '';
        alert('Thank you for your donation!');
      });
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
