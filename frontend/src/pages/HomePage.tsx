import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <Container size="sm" py={120}>
      <Stack align="center" gap="lg">
        <Title order={1} ta="center">
          Добро пожаловать в Календарь бронирований
        </Title>

        <Text c="dimmed" ta="center" size="lg" maw={520}>
          Планируйте свободные слоты в календаре и принимайте бронирования от гостей.
          Управляйте типами событий и расписанием в одном месте.
        </Text>

        <Button component={Link} to="/admin" size="md">
          Войти в админку
        </Button>
      </Stack>
    </Container>
  );
}
