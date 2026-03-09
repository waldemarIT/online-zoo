// ─── Animal / Pet ────────────────────────────────────────────────
export interface Animal {
  id: string;
  name: string;
  description: string;
  images: string[];
  commonName: string;
  scientificName: string;
  type: string;
  size: string;
  diet: string;
  habitat: string;
  range: string;
  funFact: string;
}

// ─── Feedback / Review ───────────────────────────────────────────
export interface Feedback {
  id: string;
  author: string;
  location: string;
  date: string;
  text: string;
}

// ─── User ────────────────────────────────────────────────────────
export interface User {
  id: string;
  login: string;
  name: string;
  email: string;
}

export interface AuthCredentials {
  login: string;
  password: string;
}

export interface RegisterPayload {
  login: string;
  password: string;
  name: string;
}

// ─── Donation ────────────────────────────────────────────────────
export interface DonationPayload {
  amount: number;
  petId: string;
  petName: string;
  name: string;
  email: string;
  cardNumber: string;
  cvv: string;
  expirationDate: string;
  monthly: boolean;
}

export interface DonationResponse {
  success: boolean;
  message: string;
}

// ─── Saved Card ──────────────────────────────────────────────────
export interface SavedCard {
  id: string;
  cardNumber: string;
  cvv: string;
  expirationDate: string;
  label: string;
}

// ─── API Response wrapper ────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ─── Enums ───────────────────────────────────────────────────────
export enum AnimalId {
  Panda = 'panda',
  Eagle = 'eagle',
  Gorilla = 'gorilla',
  Lemur = 'lemur',
}

export enum LocalStorageKey {
  User = 'zoo_user',
  Token = 'zoo_token',
  SavedCards = 'zoo_saved_cards',
}

export enum DonationStep {
  Hero = 0,
  DonationInfo = 1,
  Billing = 2,
  Payment = 3,
}
