import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';

import { getEventTypes } from '../api/events';
import type { EventType } from '../api/types';
import { CreateEventTypeModal } from '../components/CreateEventTypeModal';

export function EventsPage() {
  const [items, setItems] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, modal] = useDisclosure(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getEventTypes();
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Не удалось загрузить типы событий',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreated = (created: EventType) => {
    // Prism не персистит данные, поэтому обновляем список локально.
    setItems((prev) => [created, ...prev]);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Center py="xl">
          <Loader />
        </Center>
      );
    }

    if (error) {
      return (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      );
    }

    if (items.length === 0) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          Пока нет типов событий. Создайте первый.
        </Text>
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
        {items.map((item) => (
          <Card key={item.id} withBorder shadow="sm" padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
              <Text fw={600}>{item.name}</Text>
              <Badge variant="light">{item.durationMinutes} мин</Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {item.description || 'Без описания'}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>Типы событий</Title>
          <Group gap="sm">
            <Button component={Link} to="/admin" variant="default">
              Назад в админку
            </Button>
            <Button onClick={modal.open}>Создать тип события</Button>
          </Group>
        </Group>

        {renderContent()}
      </Stack>

      <CreateEventTypeModal
        opened={modalOpened}
        onClose={modal.close}
        onCreated={handleCreated}
      />
    </Container>
  );
}
