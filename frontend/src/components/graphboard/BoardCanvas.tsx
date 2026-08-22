import { useRef } from 'react';

import type { BoardItem } from '../../api/graphboard';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  MAX_SIZE,
  MIN_SIZE,
  PERIMETER,
  clamp,
  clampToBoard,
  clientToBoard,
} from './geometry';
import { ShapeGlyph } from './ShapeGlyph';

const HANDLE_R = 7;
const ROTATE_OFFSET = 28;

const CORNERS = [
  { corner: 'nw', sx: -1, sy: -1, cursor: 'nwse-resize' },
  { corner: 'ne', sx: 1, sy: -1, cursor: 'nesw-resize' },
  { corner: 'se', sx: 1, sy: 1, cursor: 'nwse-resize' },
  { corner: 'sw', sx: -1, sy: 1, cursor: 'nesw-resize' },
] as const;

type Drag =
  | null
  | { type: 'move'; id: string; offsetX: number; offsetY: number }
  | {
      type: 'resize';
      id: string;
      sx: number;
      sy: number;
      // Зафиксированный (противоположный) угол и локальные оси на момент старта.
      anchorX: number;
      anchorY: number;
      exX: number;
      exY: number;
      eyX: number;
      eyY: number;
    }
  | { type: 'rotate'; id: string; cx: number; cy: number };

interface BoardCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  items: BoardItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateItem: (id: string, patch: Partial<BoardItem>) => void;
}

export function BoardCanvas({
  svgRef,
  items,
  selectedId,
  onSelect,
  onUpdateItem,
}: BoardCanvasProps) {
  const dragRef = useRef<Drag>(null);

  const startMove = (event: React.PointerEvent, item: BoardItem) => {
    event.stopPropagation();
    onSelect(item.id);
    const svg = svgRef.current;
    if (!svg) return;
    const p = clientToBoard(svg, event.clientX, event.clientY);
    dragRef.current = {
      type: 'move',
      id: item.id,
      offsetX: p.x - item.x,
      offsetY: p.y - item.y,
    };
    svg.setPointerCapture(event.pointerId);
  };

  const startResize = (
    event: React.PointerEvent,
    item: BoardItem,
    sx: number,
    sy: number,
  ) => {
    event.stopPropagation();
    onSelect(item.id);
    const svg = svgRef.current;
    if (!svg) return;

    const theta = (item.rotation * Math.PI) / 180;
    const exX = Math.cos(theta);
    const exY = Math.sin(theta);
    const eyX = -Math.sin(theta);
    const eyY = Math.cos(theta);

    // Противоположный угол в мировых координатах — он остаётся неподвижным.
    const anchorX =
      item.x + -sx * (item.width / 2) * exX + -sy * (item.height / 2) * eyX;
    const anchorY =
      item.y + -sx * (item.width / 2) * exY + -sy * (item.height / 2) * eyY;

    dragRef.current = {
      type: 'resize',
      id: item.id,
      sx,
      sy,
      anchorX,
      anchorY,
      exX,
      exY,
      eyX,
      eyY,
    };
    svg.setPointerCapture(event.pointerId);
  };

  const startRotate = (event: React.PointerEvent, item: BoardItem) => {
    event.stopPropagation();
    onSelect(item.id);
    const svg = svgRef.current;
    if (!svg) return;
    dragRef.current = { type: 'rotate', id: item.id, cx: item.x, cy: item.y };
    svg.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || !svg) return;

    const p = clientToBoard(svg, event.clientX, event.clientY);

    if (drag.type === 'move') {
      const next = clampToBoard(p.x - drag.offsetX, p.y - drag.offsetY);
      onUpdateItem(drag.id, next);
      return;
    }

    if (drag.type === 'resize') {
      const dx = p.x - drag.anchorX;
      const dy = p.y - drag.anchorY;
      // Проекция вектора «якорь → курсор» на локальные оси фигуры.
      const projX = dx * drag.exX + dy * drag.exY;
      const projY = dx * drag.eyX + dy * drag.eyY;
      const width = clamp(projX * drag.sx, MIN_SIZE, MAX_SIZE);
      const height = clamp(projY * drag.sy, MIN_SIZE, MAX_SIZE);
      const cx =
        drag.anchorX + drag.sx * (width / 2) * drag.exX + drag.sy * (height / 2) * drag.eyX;
      const cy =
        drag.anchorY + drag.sx * (width / 2) * drag.exY + drag.sy * (height / 2) * drag.eyY;
      onUpdateItem(drag.id, { width, height, x: cx, y: cy });
      return;
    }

    if (drag.type === 'rotate') {
      const angle = Math.atan2(p.y - drag.cy, p.x - drag.cx);
      let deg = (angle * 180) / Math.PI + 90;
      if (event.shiftKey) {
        deg = Math.round(deg / 15) * 15;
      }
      onUpdateItem(drag.id, { rotation: Math.round(deg) });
    }
  };

  const endDrag = (event: React.PointerEvent) => {
    if (dragRef.current && svgRef.current) {
      svgRef.current.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', touchAction: 'none', userSelect: 'none' }}
      onPointerDown={() => onSelect(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Периметр рабочей зоны */}
      <rect
        x={PERIMETER.x}
        y={PERIMETER.y}
        width={PERIMETER.width}
        height={PERIMETER.height}
        fill="none"
        stroke="var(--mantine-color-gray-5)"
        strokeWidth={2}
      />

      {items.map((item) => {
        const selected = item.id === selectedId;
        const halfW = item.width / 2;
        const halfH = item.height / 2;

        return (
          <g
            key={item.id}
            transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}
          >
            {/* Область захвата для перемещения */}
            <rect
              x={-halfW}
              y={-halfH}
              width={item.width}
              height={item.height}
              fill="transparent"
              style={{ cursor: 'move' }}
              onPointerDown={(e) => startMove(e, item)}
            />

            <g
              style={{
                color: selected
                  ? 'var(--mantine-color-indigo-6)'
                  : 'var(--mantine-color-text)',
                pointerEvents: 'none',
              }}
            >
              <ShapeGlyph kind={item.kind} width={item.width} height={item.height} />
            </g>

            {item.label && (
              <text
                x={0}
                y={halfH + 16}
                textAnchor="middle"
                fontSize={14}
                fill="var(--mantine-color-text)"
                style={{ pointerEvents: 'none' }}
              >
                {item.label}
              </text>
            )}

            {selected && (
              <g>
                {/* Рамка выделения */}
                <rect
                  x={-halfW}
                  y={-halfH}
                  width={item.width}
                  height={item.height}
                  fill="none"
                  stroke="var(--mantine-color-indigo-6)"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  style={{ pointerEvents: 'none' }}
                />

                {/* Ручка поворота */}
                <line
                  x1={0}
                  y1={-halfH}
                  x2={0}
                  y2={-halfH - ROTATE_OFFSET}
                  stroke="var(--mantine-color-indigo-6)"
                  strokeWidth={1.5}
                  style={{ pointerEvents: 'none' }}
                />
                <circle
                  cx={0}
                  cy={-halfH - ROTATE_OFFSET}
                  r={HANDLE_R}
                  fill="var(--mantine-color-body)"
                  stroke="var(--mantine-color-indigo-6)"
                  strokeWidth={1.5}
                  style={{ cursor: 'grab' }}
                  onPointerDown={(e) => startRotate(e, item)}
                />

                {/* Угловые ручки ресайза */}
                {CORNERS.map(({ corner, sx, sy, cursor }) => (
                  <rect
                    key={corner}
                    x={sx * halfW - HANDLE_R}
                    y={sy * halfH - HANDLE_R}
                    width={HANDLE_R * 2}
                    height={HANDLE_R * 2}
                    fill="var(--mantine-color-body)"
                    stroke="var(--mantine-color-indigo-6)"
                    strokeWidth={1.5}
                    style={{ cursor }}
                    onPointerDown={(e) => startResize(e, item, sx, sy)}
                  />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
