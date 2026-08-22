import type { ShapeKind } from '../../api/graphboard';

interface ShapeGlyphProps {
  kind: ShapeKind;
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Рисует фигуру в собственной системе координат с центром в (0,0).
 * Используется и в палитре (превью), и на доске.
 */
export function ShapeGlyph({
  kind,
  width,
  height,
  color = 'currentColor',
  strokeWidth = 2,
}: ShapeGlyphProps) {
  const halfW = width / 2;
  const halfH = height / 2;

  if (kind === 'square' || kind === 'rect') {
    return (
      <rect
        x={-halfW}
        y={-halfH}
        width={width}
        height={height}
        rx={Math.min(width, height) * 0.08}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
  }

  // kind === 'dish' — схематичная спутниковая антенна (параболический профиль сбоку).
  // Вогнутый «серп»-рефлектор, раскрыв которого обращён вверх-вправо,
  // вынос (boom) с облучателем (LNB) в фокусе, вертикальная мачта с основанием.

  // Точки кромки раскрыва (рим).
  const rimTop = { x: halfW * 0.6, y: -halfH * 0.85 };
  const rimBottom = { x: -halfW * 0.15, y: halfH * 0.4 };

  // Радиусы дуг рефлектора (внешняя выпуклость «спинки» влево-вниз).
  const outerRx = halfW * 1.25;
  const outerRy = halfH * 1.25;
  const innerRx = halfW * 0.7;
  const innerRy = halfH * 0.7;

  // Серп рефлектора: внешняя дуга сверху вниз + внутренняя обратно.
  const dish = [
    `M ${rimTop.x} ${rimTop.y}`,
    `A ${outerRx} ${outerRy} 0 0 0 ${rimBottom.x} ${rimBottom.y}`,
    `A ${innerRx} ${innerRy} 0 0 1 ${rimTop.x} ${rimTop.y}`,
    'Z',
  ].join(' ');

  // Фокус (облучатель) — вынесен вперёд от раскрыва (вверх-вправо).
  const feedX = halfW * 0.5;
  const feedY = -halfH * 0.05;
  const feedR = Math.max(strokeWidth, halfW * 0.13);

  // Верх мачты — у «спинки» тарелки.
  const mastTopY = halfH * 0.1;

  return (
    <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* Рефлектор (тарелка) */}
      <path d={dish} fill={color} stroke="none" />

      {/* Вынос (boom) от нижней кромки к облучателю */}
      <line x1={rimBottom.x} y1={rimBottom.y} x2={feedX} y2={feedY} />

      {/* Облучатель (LNB) */}
      <circle cx={feedX} cy={feedY} r={feedR} fill={color} stroke="none" />

      {/* Мачта */}
      <line x1={0} y1={mastTopY} x2={0} y2={halfH} />

      {/* Основание */}
      <line x1={-halfW * 0.4} y1={halfH} x2={halfW * 0.4} y2={halfH} />
    </g>
  );
}
