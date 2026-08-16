import type { EventType, EventTypeInput } from './types';

// Базовый префикс проксируется Vite на mock-сервер Prism (см. vite.config.ts).
const API_BASE = '/api';

// Создание типа события возможно только через POST /owner/{ownerId}.
// UI владельцев пока нет, поэтому используем константу.
const DEFAULT_OWNER_ID = 'owner-1';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getEventTypes(): Promise<EventType[]> {
  const response = await fetch(`${API_BASE}/event-types`, {
    headers: { Accept: 'application/json' },
  });

  return parseJson<EventType[]>(response);
}

export async function createEventType(input: EventTypeInput): Promise<EventType> {
  const payload: EventType = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description,
    durationMinutes: input.durationMinutes,
    bookingIds: [],
  };

  const response = await fetch(`${API_BASE}/owner/${DEFAULT_OWNER_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  await parseJson<EventType>(response);

  // Prism не сохраняет состояние и возвращает статический пример,
  // поэтому для UI используем данные, которые реально отправили.
  return payload;
}
