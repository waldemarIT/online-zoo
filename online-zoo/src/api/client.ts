import type { ApiResponse } from '../types/index.js';

const BASE_URL = 'https://vsqsnqnxkh.execute-api.eu-central-1.amazonaws.com/prod';
const FETCH_TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;

async function doFetch<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('zoo_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const errorText = await response.text();
    // Detect intentional test errors from RS School backend
    try {
      const parsed = JSON.parse(errorText) as { isTestError?: boolean };
      if (parsed.isTestError) throw new Error('__TEST_ERROR__');
    } catch (e) {
      if ((e as Error).message === '__TEST_ERROR__') throw e;
    }
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const data = (await response.json()) as T;
  return { data };
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await doFetch<T>(endpoint, options);
    } catch (err) {
      if ((err as Error).message === '__TEST_ERROR__' && attempt < MAX_RETRIES) {
        await new Promise(res => setTimeout(res, 300 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Request failed after retries');
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
