import type { ShapeKind } from '../../api/graphboard';

// Внутренняя (фиксированная) система координат доски.
// SVG масштабируется под контейнер через viewBox, поэтому расчёты
// не зависят от реального размера экрана и переживают ресайз.
export const BOARD_WIDTH = 1000;
export const BOARD_HEIGHT = 700;

// Отступ периметра от краёв поля (8%) — «прямоугольник с отступами».
export const PERIMETER_INSET = 0.08;

export const PERIMETER = {
  x: BOARD_WIDTH * PERIMETER_INSET,
  y: BOARD_HEIGHT * PERIMETER_INSET,
  width: BOARD_WIDTH * (1 - 2 * PERIMETER_INSET),
  height: BOARD_HEIGHT * (1 - 2 * PERIMETER_INSET),
};

// Базовый размер миниатюры — ~5% от ширины периметра.
export const UNIT = PERIMETER.width * 0.05;

export const MIN_SIZE = UNIT * 0.4;
export const MAX_SIZE = UNIT * 6;

// Габариты по умолчанию для каждой фигуры.
export function defaultSize(kind: ShapeKind): { width: number; height: number } {
  switch (kind) {
    case 'square':
      return { width: UNIT, height: UNIT };
    case 'rect':
      return { width: UNIT * 1.6, height: UNIT };
    case 'dish':
      return { width: UNIT * 1.2, height: UNIT };
    default:
      return { width: UNIT, height: UNIT };
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Удерживаем центр фигуры в пределах поля, чтобы элемент не терялся за краем.
export function clampToBoard(x: number, y: number): { x: number; y: number } {
  return {
    x: clamp(x, 0, BOARD_WIDTH),
    y: clamp(y, 0, BOARD_HEIGHT),
  };
}

// Перевод экранных координат указателя в координаты viewBox доски.
export function clientToBoard(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return { x: 0, y: 0 };
  }
  const local = point.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}
