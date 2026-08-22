import { Stack, Text, UnstyledButton } from '@mantine/core';

import type { ShapeKind } from '../../api/graphboard';
import { defaultSize } from './geometry';
import { ShapeGlyph } from './ShapeGlyph';

interface PaletteEntry {
  kind: ShapeKind;
  label: string;
}

const ENTRIES: PaletteEntry[] = [
  { kind: 'dish', label: 'Антенна' },
  { kind: 'square', label: 'Квадрат' },
  { kind: 'rect', label: 'Прямоугольник' },
];

interface PaletteProps {
  onSpawnStart: (kind: ShapeKind, event: React.PointerEvent) => void;
}

export function Palette({ onSpawnStart }: PaletteProps) {
  return (
    <Stack gap="sm">
      <Text size="sm" fw={600} c="dimmed">
        Элементы
      </Text>

      {ENTRIES.map((entry) => {
        const size = defaultSize(entry.kind);
        return (
          <UnstyledButton
            key={entry.kind}
            onPointerDown={(event) => {
              event.preventDefault();
              onSpawnStart(entry.kind, event);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 8,
              borderRadius: 8,
              border: '1px solid var(--mantine-color-default-border)',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <svg
              width={48}
              height={48}
              viewBox="-50 -50 100 100"
              style={{ flexShrink: 0, color: 'var(--mantine-color-text)' }}
            >
              <ShapeGlyph kind={entry.kind} width={size.width} height={size.height} />
            </svg>
            <Text size="sm">{entry.label}</Text>
          </UnstyledButton>
        );
      })}

      <Text size="xs" c="dimmed">
        Перетащите элемент на поле.
      </Text>
    </Stack>
  );
}
