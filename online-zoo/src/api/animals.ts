import { apiGet } from './client.js';
import type { Animal, Feedback } from '../types/index.js';

export function fetchAnimals(): Promise<Animal[]> {
  return apiGet<Animal[]>('/animals');
}

export function fetchAnimalById(id: string): Promise<Animal> {
  return apiGet<Animal>(`/animals/${id}`);
}

export function fetchFeedbacks(): Promise<Feedback[]> {
  return apiGet<Feedback[]>('/feedbacks');
}
