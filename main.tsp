import "@typespec/http";

using Http;

@service(#{ title: "Calendar Service" })
namespace CalendarService;

model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;

  /** Идентификаторы бронирований данного типа события */
  bookingIds: string[];
}

model Event {
  id: string;
  typeId: string;
  name: string;
  description: string;
}

model Booking {
  id: string;

  /** Идентификатор типа события */
  typeId: string;

  /** Идентификаторы временных слотов */
  slotIds: string[];

  /** Идентификатор гостя */
  guestId: string;
}

model CalendarOwner {
  name: string;

  /** Идентификаторы типов событий владельца */
  typeIds: string[];
}

model CalendarGuest {
  id: string;
  name: string = "guest";

  /** Идентификаторы бронирований гостя */
  bookingIds: string[];
}

model TimeSlot {
  id: string;
  available: boolean = true;
  minDurationMinutes: int32 = 15;

  /** Идентификатор бронирования, к которому относится слот */
  bookingId: string;
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