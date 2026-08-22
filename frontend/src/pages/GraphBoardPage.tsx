import { useCallback, useEffect, useRef, useState } from 'react';
import { AppShell, Box, Button, Group, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

import type { BoardItem, ShapeKind } from '../api/graphboard';
import { getBoardLayout, saveBoardLayout } from '../api/graphboard';
import { BoardCanvas } from '../components/graphboard/BoardCanvas';
import { Inspector } from '../components/graphboard/Inspector';
import { Palette } from '../components/graphboard/Palette';
import { ShapeGlyph } from '../components/graphboard/ShapeGlyph';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  MIN_SIZE,
  clampToBoard,
  clientToBoard,
  defaultSize,
} from '../components/graphboard/geometry';

const HEADER_HEIGHT = 56;
const VALID_KINDS: ShapeKind[] = ['dish', 'square', 'rect'];

// Отсеиваем непригодные элементы (например, статичный пример от Prism-mock).
function normalizeItems(items: BoardItem[]): BoardItem[] {
  return items.filter(
    (it) =>
      VALID_KINDS.includes(it.kind) &&
      Number.isFinite(it.x) &&
      Number.isFinite(it.y) &&
      it.x >= 0 &&
      it.x <= BOARD_WIDTH &&
      it.y >= 0 &&
      it.y <= BOARD_HEIGHT &&
      it.width >= MIN_SIZE &&
      it.height >= MIN_SIZE,
  );
}

export function GraphBoardPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const spawnRef = useRef<ShapeKind | null>(null);

  const [items, setItems] = useState<BoardItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; kind: ShapeKind } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const selectedItem = items.find((it) => it.id === selectedId) ?? null;

  // Загрузка сохранённой раскладки (best-effort).
  useEffect(() => {
    let cancelled = false;
    getBoardLayout().then((layout) => {
      if (!cancelled) {
        const clean = normalizeItems(layout.items);
        if (clean.length > 0) {
          setItems(clean);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<BoardItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const addItemAt = useCallback((kind: ShapeKind, boardX: number, boardY: number) => {
    const size = defaultSize(kind);
    const pos = clampToBoard(boardX, boardY);
    const newItem: BoardItem = {
      id: crypto.randomUUID(),
      kind,
      x: pos.x,
      y: pos.y,
      width: size.width,
      height: size.height,
      rotation: 0,
      label: '',
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  }, []);

  // Перетаскивание новой фигуры из палитры на поле.
  const handleSpawnStart = useCallback(
    (kind: ShapeKind, event: React.PointerEvent) => {
      spawnRef.current = kind;
      setGhost({ x: event.clientX, y: event.clientY, kind });

      const handleMove = (e: PointerEvent) => {
        setGhost((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
      };

      const handleUp = (e: PointerEvent) => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        const spawnKind = spawnRef.current;
        spawnRef.current = null;
        setGhost(null);

        const svg = svgRef.current;
        if (!spawnKind || !svg) return;

        const rect = svg.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (inside) {
          const p = clientToBoard(svg, e.clientX, e.clientY);
          addItemAt(spawnKind, p.x, p.y);
        }
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [addItemAt],
  );

  // Удаление выбранного по Delete/Backspace (кроме случаев ввода в поля).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (selectedId) {
        e.preventDefault();
        deleteItem(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, deleteItem]);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveBoardLayout(items);
      setStatus('Сохранено');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setItems([]);
    setSelectedId(null);
  };

  const ghostSize = ghost ? defaultSize(ghost.kind) : null;

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      navbar={{ width: 240, breakpoint: 'sm' }}
      aside={{ width: 300, breakpoint: 'sm' }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4}>Графическая доска</Title>
          <Group gap="sm">
            {status && (
              <Text size="sm" c="dimmed">
                {status}
              </Text>
            )}
            <Button variant="default" size="xs" onClick={handleClear}>
              Очистить
            </Button>
            <Button size="xs" loading={saving} onClick={handleSave}>
              Сохранить
            </Button>
            <Button component={Link} to="/" variant="subtle" size="xs">
              На главную
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Palette onSpawnStart={handleSpawnStart} />
      </AppShell.Navbar>

      <AppShell.Aside p="md">
        <Inspector item={selectedItem} onChange={updateItem} onDelete={deleteItem} />
      </AppShell.Aside>

      <AppShell.Main>
        <Box
          style={{
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            background: 'var(--mantine-color-body)',
          }}
        >
          <BoardCanvas
            svgRef={svgRef}
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateItem={updateItem}
          />
        </Box>
      </AppShell.Main>

      {/* «Призрак» перетаскиваемой из палитры фигуры */}
      {ghost && ghostSize && (
        <svg
          width={48}
          height={48}
          viewBox="-50 -50 100 100"
          style={{
            position: 'fixed',
            left: ghost.x - 24,
            top: ghost.y - 24,
            pointerEvents: 'none',
            color: 'var(--mantine-color-indigo-6)',
            opacity: 0.8,
            zIndex: 1000,
          }}
        >
          <ShapeGlyph kind={ghost.kind} width={ghostSize.width} height={ghostSize.height} />
        </svg>
      )}
    </AppShell>
  );
}
