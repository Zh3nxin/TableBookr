import {
  AvailabilitySlot,
  BookingDateOption,
  PublicRestaurantResponse
} from "@/lib/types/public-booking";

export type BookingPageSearchParams = {
  guests?: string;
  date?: string;
  time?: string;
  ready?: string;
};

export type InitialBookingPageState = {
  dateOptions: BookingDateOption[];
  initialDate: string;
  initialSlots: AvailabilitySlot[];
  initialGuestCount: number;
  initialSelectedTime: string | null;
  initialIsReady: boolean;
};

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTodayDateInTimeZone(timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(new Date());

  return toIsoDate(
    Number(parts.find((part) => part.type === "year")?.value),
    Number(parts.find((part) => part.type === "month")?.value),
    Number(parts.find((part) => part.type === "day")?.value)
  );
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + days);

  return toIsoDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  );
}

function buildDateOptions(timeZone: string): BookingDateOption[] {
  const today = getTodayDateInTimeZone(timeZone);

  return Array.from({ length: 7 }, (_, index) => {
    const value = addDays(today, index);
    const [, , day] = value.split("-").map(Number);

    return {
      value,
      dayNumber: String(day)
    };
  });
}

function getInitialStepOneState(timeZone: string) {
  const dateOptions = buildDateOptions(timeZone);

  return {
    dateOptions,
    initialDate: dateOptions[0]?.value ?? getTodayDateInTimeZone(timeZone),
    initialGuestCount: 1,
    initialSlots: []
  };
}

function parseGuestCount(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 16) {
    return fallback;
  }

  return parsedValue;
}

function parseDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function parseTime(value: string | undefined) {
  if (!value) {
    return null;
  }

  return /^\d{2}:\d{2}$/.test(value) ? value : null;
}

export async function loadInitialBookingPageState(
  restaurant: PublicRestaurantResponse,
  searchParams: BookingPageSearchParams
): Promise<InitialBookingPageState> {
  const initialStepOneState = getInitialStepOneState(restaurant.timezone);
  const requestedGuestCount = parseGuestCount(
    searchParams.guests,
    initialStepOneState.initialGuestCount
  );
  const requestedDate = parseDate(searchParams.date);
  const requestedTime = parseTime(searchParams.time);
  const shouldUseRequestedDate =
    requestedDate &&
    initialStepOneState.dateOptions.some((option) => option.value === requestedDate);

  let initialDate = shouldUseRequestedDate ? requestedDate : initialStepOneState.initialDate;

  return {
    dateOptions: initialStepOneState.dateOptions,
    initialDate,
    initialSlots: initialStepOneState.initialSlots,
    initialGuestCount: requestedGuestCount,
    initialSelectedTime: requestedTime,
    initialIsReady: searchParams.ready === "1" && Boolean(requestedTime)
  };
}
