import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export function AdminPage() {
  return (
    <Container size="sm" py={120}>
      <Stack align="center" gap="lg">
        <Title order={1} ta="center">
          Админка
        </Title>

        <Text c="dimmed" ta="center" size="lg" maw={520}>
          Раздел находится в разработке. Здесь появится управление календарём:
          типы событий, слоты и бронирования.
        </Text>

        <Group justify="center" gap="sm">
          <Button component={Link} to="/admin/events" size="md">
            Типы событий
          </Button>
          <Button component={Link} to="/" variant="light" size="md">
            На главную
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
