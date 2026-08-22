// Типы и клиент для графической доски (/graphboard).
// Соответствует моделям BoardItem / BoardLayout в main.tsp.

const API_BASE = '/api';

// Prism-mock не хранит состояние, поэтому используем фиксированный id раскладки.
const LAYOUT_ID = 'default';

export type ShapeKind = 'dish' | 'square' | 'rect';

export interface BoardItem {
  id: string;
  kind: ShapeKind;
  /** Координаты центра в системе координат доски (viewBox). */
  x: number;
  y: number;
  /** Габариты ограничивающего прямоугольника. */
  width: number;
  height: number;
  /** Угол поворота в градусах. */
  rotation: number;
  /** Текстовая подпись. */
  label: string;
}

export interface BoardLayout {
  id: string;
  items: BoardItem[];
}

/**
 * Загрузить раскладку доски.
 * На mock-сервере Prism возвращается статический пример, поэтому вызов
 * best-effort: при ошибке или неожиданной структуре возвращаем пустую доску.
 */
export async function getBoardLayout(): Promise<BoardLayout> {
  try {
    const response = await fetch(`${API_BASE}/graphboard`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return { id: LAYOUT_ID, items: [] };
    }

    const data = (await response.json()) as Partial<BoardLayout>;

    return {
      id: typeof data.id === 'string' ? data.id : LAYOUT_ID,
      items: Array.isArray(data.items) ? (data.items as BoardItem[]) : [],
    };
  } catch {
    return { id: LAYOUT_ID, items: [] };
  }
}

/**
 * Сохранить раскладку доски.
 * Prism не персистит данные, поэтому источником истины остаётся локальное
 * состояние: возвращаем отправленный payload.
 */
export async function saveBoardLayout(items: BoardItem[]): Promise<BoardLayout> {
  const payload: BoardLayout = { id: LAYOUT_ID, items };

  const response = await fetch(`${API_BASE}/graphboard`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Ошибка сохранения: ${response.status} ${response.statusText}`);
  }

  return payload;
}
