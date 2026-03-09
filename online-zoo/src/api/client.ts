import type { ApiResponse } from '../types/index.js';

const BASE_URL = 'https://zoo-back-end.example.com/api'; // TODO: replace with real URL from Swagger

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('zoo_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const data = (await response.json()) as T;
  return { data };
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const { data } = await apiFetch<T>(endpoint);
  return data;
}

export async function apiPost<TBody, TResponse>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const { data } = await apiFetch<TResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data;
}
