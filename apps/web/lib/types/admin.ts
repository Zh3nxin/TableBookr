export type AdminBookingStatus = "confirmed" | "pending" | "rejected" | "canceled";
export type AdminBookingListStatusFilter =
  | "all"
  | "active"
  | "pending"
  | "confirmed"
  | "rejected"
  | "canceled";
export type AdminBookingAction = "accept" | "reject" | "cancel";

export type AdminBookingSummary = {
  id: string;
  status: AdminBookingStatus;
  source: "website";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guestCount: number;
  bookingDate: string;
  bookingStartTime: string;
  bookingEndTime: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminBookingsResponse = {
  bookings: AdminBookingSummary[];
};

export type AdminBookingResponse = {
  booking: AdminBookingSummary;
};
