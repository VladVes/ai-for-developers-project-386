// Типы, соответствующие OpenAPI-схеме сервиса (см. tsp-output/schema/openapi.yaml).

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  // Теперь бронирования хранятся как список идентификаторов (см. main.tsp).
  bookingIds: string[];
}

// Данные, которые пользователь вводит в форме создания типа события.
export interface EventTypeInput {
  name: string;
  description: string;
  durationMinutes: number;
}

// Бронирование с денормализованным типом события (см. main.tsp).
// startDateTime / endDateTime — ISO-строки формата date-time (UTC).
export interface Booking {
  id: string;
  typeId: string;
  slotIds: string[];
  eventType: EventType;
  guestId: string;
  startDateTime: string;
  endDateTime: string;
}
