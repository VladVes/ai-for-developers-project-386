import { Button, NumberInput, Slider, Stack, Text, TextInput } from '@mantine/core';

import type { BoardItem } from '../../api/graphboard';
import { MAX_SIZE, MIN_SIZE } from './geometry';

const KIND_LABELS: Record<BoardItem['kind'], string> = {
  dish: 'Антенна',
  square: 'Квадрат',
  rect: 'Прямоугольник',
};

interface InspectorProps {
  item: BoardItem | null;
  onChange: (id: string, patch: Partial<BoardItem>) => void;
  onDelete: (id: string) => void;
}

export function Inspector({ item, onChange, onDelete }: InspectorProps) {
  if (!item) {
    return (
      <Text size="sm" c="dimmed">
        Выберите элемент на поле, чтобы изменить его свойства.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <Text size="sm" fw={600}>
        {KIND_LABELS[item.kind]}
      </Text>

      <TextInput
        label="Подпись"
        placeholder="Название элемента"
        value={item.label}
        onChange={(e) => onChange(item.id, { label: e.currentTarget.value })}
      />

      <NumberInput
        label="Ширина"
        min={Math.round(MIN_SIZE)}
        max={Math.round(MAX_SIZE)}
        value={Math.round(item.width)}
        onChange={(value) =>
          onChange(item.id, { width: typeof value === 'number' ? value : item.width })
        }
      />

      <NumberInput
        label="Высота"
        min={Math.round(MIN_SIZE)}
        max={Math.round(MAX_SIZE)}
        value={Math.round(item.height)}
        onChange={(value) =>
          onChange(item.id, { height: typeof value === 'number' ? value : item.height })
        }
      />

      <div>
        <Text size="sm" mb={4}>
          Поворот: {Math.round(item.rotation)}°
        </Text>
        <Slider
          min={-180}
          max={180}
          value={item.rotation}
          onChange={(value) => onChange(item.id, { rotation: value })}
          marks={[
            { value: -180, label: '-180' },
            { value: 0, label: '0' },
            { value: 180, label: '180' },
          ]}
        />
      </div>

      <Button color="red" variant="light" onClick={() => onDelete(item.id)} mt="sm">
        Удалить элемент
      </Button>
    </Stack>
  );
}
