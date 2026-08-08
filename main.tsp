import "@typespec/http";

using Http;

@service(#{ title: "Calendar Service" })
namespace CalendarService;

model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
  bookings: Booking[];
}

model Event {
  id: string;
  type: EventType;
  name: string;
  description: string;
}

model Booking {
  id: string;
  type: EventType;
  slots: TimeSlot[];
  guest: CalendarGuest;
}

model CalendarOwner {
  name: string;
  types: EventType[];
}

model CalendarGuest {
  id: string;
  name: string = "guest";
  bookings: Booking[];
}

model TimeSlot {
  id: string;
  available: boolean = true;
  minDurationMinutes: int32 = 15;
  booking: Booking;
}

model BookingCreateRequest {
  type: string;
  slots: string[];
  guestId: string;
}

@route("/owner")
interface CalendarOwners {
  /** Создать тип события (владелец календаря) */
  @post
  createType(@path ownerId: string, @body body: EventType): EventType;
}

@route("/event-types")
interface EventTypes {
  /** Получить все типы событий */
  @get
  list(): EventType[];
}

@route("/bookings")
interface Bookings {
  /** Получить все бронирования */
  @get
  list(): Booking[];

  /** Создать бронирование */
  @post
  create(@body body: BookingCreateRequest): Booking;
}