import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';

import { createEventType } from '../api/events';
import type { EventType, EventTypeInput } from '../api/types';

interface CreateEventTypeModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: (created: EventType) => void;
}

export function CreateEventTypeModal({
  opened,
  onClose,
  onCreated,
}: CreateEventTypeModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EventTypeInput>({
    initialValues: {
      name: '',
      description: '',
      durationMinutes: 30,
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? 'Укажите название типа события' : null,
      durationMinutes: (value) =>
        value > 0 ? null : 'Длительность должна быть больше 0',
    },
  });

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createEventType({
        name: values.name.trim(),
        description: values.description.trim(),
        durationMinutes: values.durationMinutes,
      });

      onCreated(created);
      form.reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать тип события');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal opened={opened} onClose={handleClose} title="Новый тип события" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label="Название"
            placeholder="Например, Консультация"
            withAsterisk
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Описание"
            placeholder="Короткое описание типа события"
            autosize
            minRows={2}
            {...form.getInputProps('description')}
          />

          <NumberInput
            label="Длительность (мин)"
            placeholder="30"
            min={1}
            withAsterisk
            {...form.getInputProps('durationMinutes')}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={handleClose} disabled={submitting}>
              Отмена
            </Button>
            <Button type="submit" loading={submitting}>
              Создать
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
