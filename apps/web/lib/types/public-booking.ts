export type AvailabilitySlotStatus = "available" | "pending" | "blocked";
export type BookingCreationStatus = "confirmed" | "pending" | "blocked";

export interface PublicRestaurantResponse {
  name: string;
  slug: string;
  timezone: string;
  maxOnlinePartySize: number;
  slotIntervalMinutes: number;
  bookingDurationMinutes: number;
}

export interface AvailabilitySlot {
  time: string;
  status: AvailabilitySlotStatus;
}

export interface AvailabilityResponse {
  slots: AvailabilitySlot[];
}

export interface AvailabilityRequest {
  date: string;
  guestCount: number;
}

export interface BookingDateOption {
  value: string;
  dayNumber: string;
}

export interface CreateBookingRequest {
  guestCount: number;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

export type CreateBookingResponse =
  | {
      status: "blocked";
    }
  | {
      bookingId: string;
      status: "confirmed" | "pending";
    };
