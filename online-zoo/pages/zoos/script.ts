import { initUserMenu } from '../../src/header/userMenu.js';
import { fetchAnimals } from '../../src/api/animals.js';
import { apiPost } from '../../src/api/client.js';
import { getCurrentUser, isLoggedIn } from '../../src/api/auth.js';
import { initTheme } from '../../src/theme/theme.js';
import type { Animal, DonationPayload, DonationResponse, SavedCard } from '../../src/types/index.js';
import { LocalStorageKey } from '../../src/types/index.js';

// ── Leaflet type shim ──────────────────────────────────────
declare const L: {
  map: (id: string) => LeafletMap;
  tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (m: LeafletMap) => void };
  marker: (latlng: [number, number]) => { addTo: (m: LeafletMap) => LeafletMarker };
};
interface LeafletMap {
  setView: (latlng: [number, number], zoom: number) => LeafletMap;
  invalidateSize: () => void;
  remove: () => void;
}
interface LeafletMarker {
  bindPopup: (text: string) => LeafletMarker;
  openPopup: () => LeafletMarker;
}

// ── User menu + Theme ──────────────────────────────────────
initUserMenu();
initTheme();

// ── Detect current animal ID from URL ─────────────────────
function getAnimalIdFromUrl(): string {
  const filename = window.location.pathname.split('/').pop() ?? '';
  return filename.replace('.html', '');
}

// ── Animal coordinates map ─────────────────────────────────
const ANIMAL_COORDS: Record<string, [number, number]> = {
  panda: [30.6587, 104.0642],   // Chengdu, China
  eagle: [47.5, -122.3],         // Pacific Northwest, USA
  gorilla: [-0.7893, 11.6094],   // Gabon, Central Africa
  lemur: [-18.7669, 46.8691],    // Madagascar
};

const ANIMAL_NAMES: Record<string, string> = {
  panda: 'Giant Panda habitat — Sichuan, China',
  eagle: 'Bald Eagle habitat — Pacific Northwest, USA',
  gorilla: 'Gorilla habitat — Central Africa',
  lemur: 'Ring-tailed Lemur habitat — Madagascar',
};

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

// ── Loader / error helpers ─────────────────────────────────
const sectionLoader = document.getElementById('sectionLoader') as HTMLElement | null;
const sectionError = document.getElementById('sectionError') as HTMLElement | null;
const didYouKnowContent = document.getElementById('didYouKnowContent') as HTMLElement | null;

function showSectionLoader(): void {
  if (sectionLoader) sectionLoader.style.display = 'flex';
  if (didYouKnowContent) didYouKnowContent.style.opacity = '0.4';
}

function hideSectionLoader(): void {
  if (sectionLoader) sectionLoader.style.display = 'none';
  if (didYouKnowContent) didYouKnowContent.style.opacity = '1';
}

function showSectionError(): void {
  if (sectionLoader) sectionLoader.style.display = 'none';
  if (sectionError) sectionError.style.display = 'block';
  if (didYouKnowContent) didYouKnowContent.style.opacity = '1';
}

// ── Current animal (set after load) ───────────────────────
let currentAnimal: Animal | null = null;

// ── Load and display animal data ───────────────────────────
function updateAnimalPage(animal: Animal): void {
  const funFactEl = document.getElementById('funFactText');
  if (funFactEl && animal.funFact) funFactEl.textContent = animal.funFact;

  const detailsList = document.getElementById('detailsList');
  if (detailsList) {
    detailsList.innerHTML = `
      <p><strong>Common name:</strong> ${animal.commonName}</p>
      <p><strong>Scientific name:</strong> ${animal.scientificName}</p>
      <p><strong>Type:</strong> ${animal.type}</p>
      <p><strong>Size:</strong> ${animal.size}</p>
      <p><strong>Diet:</strong> ${animal.diet}</p>
      <p><strong>Habitat:</strong> ${animal.habitat}</p>
      <p><strong>Range:</strong> ${animal.range} <button class="view-map-btn" id="viewMapBtn">VIEW MAP <span>➔</span></button></p>
    `;
    // Re-bind the map button after re-render
    bindViewMapBtn();
  }

  const detailsText = document.getElementById('detailsText');
  if (detailsText && animal.description) detailsText.textContent = animal.description;
}

async function loadAnimalData(animalSlug: string): Promise<void> {
  showSectionLoader();
  try {
    const animals = await fetchAnimals();
    const animal = animals.find((a) =>
      a.commonName?.toLowerCase().includes(animalSlug.toLowerCase()) ||
      a.name?.toLowerCase().includes(animalSlug.toLowerCase())
    ) ?? animals[0];
    if (!animal) throw new Error('Not found');
    currentAnimal = animal;
    updateAnimalPage(animal);
    hideSectionLoader();
  } catch {
    showSectionError();
  }
}

void loadAnimalData(getAnimalIdFromUrl());

// ── Map Modal ──────────────────────────────────────────────
const mapModal = document.getElementById('mapModal') as HTMLElement | null;
const mapModalClose = document.getElementById('mapModalClose') as HTMLButtonElement | null;
const mapModalTitle = document.getElementById('mapModalTitle') as HTMLElement | null;
let leafletMap: LeafletMap | null = null;

function openMapModal(): void {
  if (!mapModal) return;
  const animalId = getAnimalIdFromUrl();
  const coords = ANIMAL_COORDS[animalId] ?? [0, 0];
  const title = ANIMAL_NAMES[animalId] ?? 'Animal Range Map';

  if (mapModalTitle) mapModalTitle.textContent = title;
  mapModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Init Leaflet after modal is visible
  setTimeout((): void => {
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }
    leafletMap = L.map('mapContainer').setView(coords, 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(leafletMap);
    L.marker(coords).addTo(leafletMap).bindPopup(title).openPopup();
    leafletMap.invalidateSize();
  }, 50);
}

function closeMapModal(): void {
  if (!mapModal) return;
  mapModal.style.display = 'none';
  document.body.style.overflow = '';
}

function bindViewMapBtn(): void {
  const btn = document.getElementById('viewMapBtn') as HTMLButtonElement | null;
  btn?.addEventListener('click', openMapModal);
}

bindViewMapBtn();
mapModalClose?.addEventListener('click', closeMapModal);
document.addEventListener('keydown', (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    closeMapModal();
    closeDonateModal();
  }
});
// Click outside map modal = close
mapModal?.addEventListener('click', (e: MouseEvent): void => {
  if (e.target === mapModal) closeMapModal();
});

// ── Donate Modal ───────────────────────────────────────────
const donateBtn = document.getElementById('donateBtn') as HTMLButtonElement | null;
const donateModal = document.getElementById('donateModal') as HTMLElement | null;
const modalClose = document.getElementById('modalClose') as HTMLButtonElement | null;
const step1Next = document.getElementById('step1Next') as HTMLButtonElement | null;
const step2Next = document.getElementById('step2Next') as HTMLButtonElement | null;
const completeDonateBtn = document.getElementById('completeDonateBtn') as HTMLButtonElement | null;
const notification = document.getElementById('donationNotification') as HTMLElement | null;
const notificationText = document.getElementById('donationNotificationText') as HTMLElement | null;
const notificationClose = document.getElementById('notificationClose') as HTMLButtonElement | null;

function showStep(n: number): void {
  document.querySelectorAll<HTMLElement>('.modal-step').forEach((s): void => {
    s.classList.remove('active');
  });
  document.getElementById(`step-${n}`)?.classList.add('active');
}

function closeDonateModal(): void {
  donateModal?.classList.remove('active');
  document.body.style.overflow = '';
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

function saveCardToStorage(card: SavedCard): void {
  const cards = getSavedCards();
  const exists = cards.some((c): boolean => c.cardNumber === card.cardNumber);
  if (!exists) {
    cards.push(card);
    localStorage.setItem(LocalStorageKey.SavedCards, JSON.stringify(cards));
  }
}

// ── Step 1 validation ──────────────────────────────────────
function getStep1Amount(): number {
  const selected = document.querySelector<HTMLButtonElement>('#step1AmountGrid .amount-btn.selected');
  const otherInput = document.getElementById('otherAmountInput') as HTMLInputElement | null;
  if (selected) {
    return parseFloat(selected.textContent?.replace('$', '') ?? '0') || 0;
  }
  if (otherInput && otherInput.style.display !== 'none' && otherInput.value) {
    return parseFloat(otherInput.value) || 0;
  }
  return 0;
}

function checkStep1Valid(): void {
  if (!step1Next) return;
  const petSelect = document.getElementById('petSelect') as HTMLSelectElement | null;
  const amount = getStep1Amount();
  const petChosen = (petSelect?.value ?? '') !== '';
  step1Next.disabled = !(amount > 0 && petChosen);
}

// Other amount input validation (only positive numbers, no scientific notation)
const otherAmountInput = document.getElementById('otherAmountInput') as HTMLInputElement | null;
const otherAmountError = document.getElementById('otherAmountError') as HTMLElement | null;
const otherAmountBtn = document.getElementById('otherAmountBtn') as HTMLButtonElement | null;

otherAmountBtn?.addEventListener('click', (): void => {
  if (otherAmountInput) {
    otherAmountInput.style.display = otherAmountInput.style.display === 'none' ? '' : 'none';
    // Deselect any selected amount btn
    document.querySelectorAll<HTMLButtonElement>('#step1AmountGrid .amount-btn').forEach((b): void => {
      b.classList.remove('selected');
    });
    checkStep1Valid();
  }
});

otherAmountInput?.addEventListener('input', (): void => {
  const val = otherAmountInput.value;
  // Reject scientific notation and non-numeric
  const isValid = /^\d+(\.\d+)?$/.test(val) && parseFloat(val) > 0;
  if (otherAmountError) {
    otherAmountError.textContent = val && !isValid
      ? 'Enter a positive number (no scientific notation)'
      : '';
  }
  // Clear selected btn
  document.querySelectorAll<HTMLButtonElement>('#step1AmountGrid .amount-btn').forEach((b): void => {
    b.classList.remove('selected');
  });
  checkStep1Valid();
});

document.getElementById('petSelect')?.addEventListener('change', checkStep1Valid);

// Amount buttons in step 1
document.getElementById('step1AmountGrid')?.addEventListener('click', (e: MouseEvent): void => {
  const target = e.target as HTMLElement;
  if (!target.classList.contains('amount-btn')) return;
  document.querySelectorAll<HTMLButtonElement>('#step1AmountGrid .amount-btn').forEach((b): void => {
    b.classList.remove('selected');
  });
  target.classList.add('selected');
  // Hide other input
  if (otherAmountInput) otherAmountInput.style.display = 'none';
  if (otherAmountError) otherAmountError.textContent = '';
  checkStep1Valid();
});

// ── Step 2 validation ──────────────────────────────────────
const billingName = document.getElementById('billingName') as HTMLInputElement | null;
const billingEmail = document.getElementById('billingEmail') as HTMLInputElement | null;
const billingNameError = document.getElementById('billingNameError') as HTMLElement | null;
const billingEmailError = document.getElementById('billingEmailError') as HTMLElement | null;

function validateBillingName(): boolean {
  const val = billingName?.value.trim() ?? '';
  if (!val) {
    if (billingNameError) billingNameError.textContent = 'Name is required';
    billingName?.classList.add('invalid');
    return false;
  }
  if (!/^[A-Za-z\s]+$/.test(val)) {
    if (billingNameError) billingNameError.textContent = 'Name must contain only letters and spaces';
    billingName?.classList.add('invalid');
    return false;
  }
  if (billingNameError) billingNameError.textContent = '';
  billingName?.classList.remove('invalid');
  return true;
}

function validateBillingEmail(): boolean {
  const val = billingEmail?.value.trim() ?? '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val || !emailRegex.test(val)) {
    if (billingEmailError) billingEmailError.textContent = 'Enter a valid email address';
    billingEmail?.classList.add('invalid');
    return false;
  }
  if (billingEmailError) billingEmailError.textContent = '';
  billingEmail?.classList.remove('invalid');
  return true;
}

function checkStep2Valid(): void {
  if (!step2Next) return;
  const nameOk = /^[A-Za-z\s]+$/.test(billingName?.value.trim() ?? '') && (billingName?.value.trim() ?? '').length > 0;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail?.value.trim() ?? '');
  step2Next.disabled = !(nameOk && emailOk);
}

billingName?.addEventListener('input', checkStep2Valid);
billingEmail?.addEventListener('input', checkStep2Valid);
billingName?.addEventListener('blur', (): void => { validateBillingName(); checkStep2Valid(); });
billingEmail?.addEventListener('blur', (): void => { validateBillingEmail(); checkStep2Valid(); });
billingName?.addEventListener('focus', (): void => {
  if (billingNameError) billingNameError.textContent = '';
  billingName.classList.remove('invalid');
});
billingEmail?.addEventListener('focus', (): void => {
  if (billingEmailError) billingEmailError.textContent = '';
  billingEmail.classList.remove('invalid');
});

// ── Step 3 validation ──────────────────────────────────────
const cardNumber = document.getElementById('cardNumber') as HTMLInputElement | null;
const cardCvv = document.getElementById('cardCvv') as HTMLInputElement | null;
const expiryMonth = document.getElementById('expiryMonth') as HTMLSelectElement | null;
const expiryYear = document.getElementById('expiryYear') as HTMLSelectElement | null;
const cardNumberError = document.getElementById('cardNumberError') as HTMLElement | null;
const cardCvvError = document.getElementById('cardCvvError') as HTMLElement | null;
const expiryError = document.getElementById('expiryError') as HTMLElement | null;

// Auto-format card number with spaces
cardNumber?.addEventListener('input', (): void => {
  let val = cardNumber.value.replace(/\D/g, '').slice(0, 16);
  cardNumber.value = val.replace(/(.{4})/g, '$1 ').trim();
  if (cardNumberError) cardNumberError.textContent = '';
  cardNumber.classList.remove('invalid');
  checkStep3Valid();
});

cardCvv?.addEventListener('input', (): void => {
  cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 3);
  if (cardCvvError) cardCvvError.textContent = '';
  cardCvv.classList.remove('invalid');
  checkStep3Valid();
});

expiryMonth?.addEventListener('change', (): void => {
  if (expiryError) expiryError.textContent = '';
  checkStep3Valid();
});
expiryYear?.addEventListener('change', (): void => {
  if (expiryError) expiryError.textContent = '';
  checkStep3Valid();
});

function isExpiryFuture(): boolean {
  const month = expiryMonth?.value ?? '';
  const year = expiryYear?.value ?? '';
  if (!month || !year) return false;
  const now = new Date();
  const fullYear = parseInt(`20${year}`, 10);
  const monthNum = parseInt(month, 10);
  // Card valid until end of expiry month
  const expiryDate = new Date(fullYear, monthNum, 1); // first day of NEXT month
  return expiryDate > now;
}

function checkStep3Valid(): void {
  if (!completeDonateBtn) return;
  const rawCard = (cardNumber?.value ?? '').replace(/\s/g, '');
  const cvvVal = cardCvv?.value ?? '';
  const cardOk = /^\d{16}$/.test(rawCard);
  const cvvOk = /^\d{3}$/.test(cvvVal);
  const expiryOk = isExpiryFuture();
  completeDonateBtn.disabled = !(cardOk && cvvOk && expiryOk);
}

// Saved cards dropdown
const savedCardsRow = document.getElementById('savedCardsRow') as HTMLElement | null;
const savedCardsSelect = document.getElementById('savedCardsSelect') as HTMLSelectElement | null;

function populateSavedCards(): void {
  const cards = getSavedCards();
  if (!cards.length || !savedCardsRow || !savedCardsSelect) return;
  savedCardsRow.style.display = 'flex';
  savedCardsSelect.innerHTML = '<option value="">-- Select saved card --</option>';
  cards.forEach((card, i): void => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = card.label;
    savedCardsSelect.appendChild(opt);
  });
}

savedCardsSelect?.addEventListener('change', (): void => {
  const idx = parseInt(savedCardsSelect.value, 10);
  if (isNaN(idx)) return;
  const cards = getSavedCards();
  const card = cards[idx];
  if (!card) return;
  if (cardNumber) cardNumber.value = card.cardNumber.replace(/(.{4})/g, '$1 ').trim();
  if (cardCvv) cardCvv.value = card.cvv;
  const [mm, yy] = card.expirationDate.split('/');
  if (expiryMonth && mm) expiryMonth.value = mm;
  if (expiryYear && yy) expiryYear.value = yy;
  checkStep3Valid();
});

// Save card checkbox visibility (logged-in only)
const saveCardRow = document.getElementById('saveCardRow') as HTMLElement | null;

// ── Show donation notification ─────────────────────────────
function showNotification(message: string, isError: boolean): void {
  if (!notification || !notificationText) return;
  notificationText.textContent = message;
  notification.style.display = 'flex';
  notification.classList.toggle('notification-error', isError);
  notification.classList.toggle('notification-success', !isError);
}

notificationClose?.addEventListener('click', (): void => {
  if (notification) notification.style.display = 'none';
});

// ── Submit donation ────────────────────────────────────────
async function submitDonation(): Promise<void> {
  const saveCardCheck = document.getElementById('saveCardCheck') as HTMLInputElement | null;

  const amount = getStep1Amount();
  const rawCard = (cardNumber?.value ?? '').replace(/\s/g, '');
  const cvvVal = cardCvv?.value.trim() ?? '';
  const expirationDate = `${expiryMonth?.value ?? ''}/${expiryYear?.value ?? ''}`;
  const petName = currentAnimal?.commonName ?? currentAnimal?.name ?? '';

  const payload: DonationPayload = {
    name: billingName?.value.trim() ?? '',
    email: billingEmail?.value.trim() ?? '',
    amount,
    petId: Number(currentAnimal?.id ?? 0),
  };

  // Save card only if checkbox is checked and user is logged in
  if (saveCardCheck?.checked && isLoggedIn()) {
    saveCardToStorage({
      id: Date.now().toString(),
      cardNumber: rawCard,
      cvv: cvvVal,
      expirationDate,
      label: `${rawCard.slice(0, 4)} **** **** ${rawCard.slice(-4)}`,
    });
  }

  try {
    await apiPost<DonationPayload, DonationResponse>('/donations', payload);
    closeDonateModal();
    showNotification(
      `Thank you for your donation of $${amount} to ${currentAnimal?.commonName ?? 'the animal'}!`,
      false
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Something went wrong. Please, try again later.';
    closeDonateModal();
    showNotification(msg, true);
  }
}

// ── Prefill billing from user profile ─────────────────────
function prefillBillingFromUser(): void {
  const user = getCurrentUser();
  if (!user) return;
  if (billingName && !billingName.value) billingName.value = user.name;
  if (billingEmail && !billingEmail.value) billingEmail.value = user.email;
  checkStep2Valid();
}

// ── Modal open / close ─────────────────────────────────────
donateBtn?.addEventListener('click', (): void => {
  showStep(0);
  const hdr = document.getElementById('modalHeaderBar');
  if (hdr) hdr.style.display = 'none';
  donateModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Reset step1 Next button
  checkStep1Valid();
  // Show save card row for logged-in users
  if (saveCardRow) {
    saveCardRow.style.display = isLoggedIn() ? 'flex' : 'none';
  }
  // Populate saved cards
  populateSavedCards();
});

modalClose?.addEventListener('click', closeDonateModal);

donateModal?.addEventListener('click', (e: MouseEvent): void => {
  const target = e.target as HTMLElement;

  // Close on overlay click (outside the donate-modal box)
  if (target === donateModal) {
    closeDonateModal();
    return;
  }

  // Hero amount buttons → go to step 1
  if (target.classList.contains('hero-amount')) {
    const hdr = document.getElementById('modalHeaderBar');
    if (hdr) hdr.style.display = 'block';
    // Pre-select this amount in step 1
    const heroText = target.textContent ?? '';
    document.querySelectorAll<HTMLButtonElement>('#step1AmountGrid .amount-btn').forEach((b): void => {
      b.classList.toggle('selected', b.textContent?.trim() === heroText.trim());
    });
    showStep(1);
    checkStep1Valid();
    return;
  }

  // Next button
  if (target.classList.contains('btn-next-step')) {
    const next = (target as HTMLButtonElement).dataset['next'];
    if (!next) return;
    if (next === '3') {
      if (!validateBillingName() || !validateBillingEmail()) return;
    }
    if (next === '2') {
      // Going to billing — prefill user data
      prefillBillingFromUser();
    }
    showStep(Number(next));
    return;
  }

  // Back button
  if (target.classList.contains('btn-back-step')) {
    const back = (target as HTMLButtonElement).dataset['back'];
    if (back) showStep(Number(back));
    return;
  }

  // Complete donation
  if (target.classList.contains('btn-complete') || target.id === 'completeDonateBtn') {
    void submitDonation();
    return;
  }

  // Amount buttons in step 1 (handled above but also catch here)
  if (target.classList.contains('amount-btn') && !target.classList.contains('hero-amount')) {
    document.querySelectorAll<HTMLButtonElement>('#step1AmountGrid .amount-btn').forEach((b): void => {
      b.classList.remove('selected');
    });
    target.classList.add('selected');
    if (otherAmountInput) otherAmountInput.style.display = 'none';
    checkStep1Valid();
  }
});

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
