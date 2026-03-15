import { apiGet } from './client.js';
import type { Animal, Feedback } from '../types/index.js';

export async function fetchAnimals(): Promise<Animal[]> {
  const raw = await apiGet<unknown>('/pets');
  if (Array.isArray(raw)) return raw as Animal[];
  const nested = Object.values(raw as Record<string, unknown>).find(v => Array.isArray(v));
  return (nested as Animal[]) ?? [];
}

export function fetchAnimalById(id: string): Promise<Animal> {
  return apiGet<Animal>(`/pets/${id}`);
}

export async function fetchFeedbacks(): Promise<Feedback[]> {
  const raw = await apiGet<unknown>('/feedback');
  if (Array.isArray(raw)) return raw as Feedback[];
  const nested = Object.values(raw as Record<string, unknown>).find(v => Array.isArray(v));
  return (nested as Feedback[]) ?? [];
}
