import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { Link } from 'react-router-dom';

import { getBookings } from '../api/bookings';
import type { Booking } from '../api/types';

// utcDateTime приходит как ISO-строка ("2026-08-22T14:00:00Z").
function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await getBookings();
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Не удалось загрузить бронирования',
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
          Пока нет бронирований.
        </Text>
      );
    }

    return (
      <Table.ScrollContainer minWidth={500}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>№</Table.Th>
              <Table.Th>Тип события</Table.Th>
              <Table.Th>Начало</Table.Th>
              <Table.Th>Окончание</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((booking, index) => (
              <Table.Tr key={booking.id}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>{booking.eventType?.name ?? '—'}</Table.Td>
                <Table.Td>{formatDateTime(booking.startDateTime)}</Table.Td>
                <Table.Td>{formatDateTime(booking.endDateTime)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>Бронирования</Title>
          <Button component={Link} to="/admin" variant="default">
            Назад в админку
          </Button>
        </Group>

        {renderContent()}
      </Stack>
    </Container>
  );
}
