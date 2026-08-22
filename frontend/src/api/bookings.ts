import type { Booking } from './types';

// Базовый префикс проксируется Vite на mock-сервер Prism (см. vite.config.ts).
const API_BASE = '/api';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getBookings(): Promise<Booking[]> {
  const response = await fetch(`${API_BASE}/bookings`, {
    headers: { Accept: 'application/json' },
  });

  return parseJson<Booking[]>(response);
}
