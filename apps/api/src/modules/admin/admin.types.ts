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
  status: "confirmed" | "pending" | "rejected" | "canceled";
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

export type AdminRequestContext = {
  adminUserId: string;
  restaurantId: string;
  restaurantTimezone: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  adminUser: {
    id: string;
    name: string;
    email: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
};

export type AdminAccessTokenPayload = {
  adminUserId: string;
  restaurantId: string;
};
