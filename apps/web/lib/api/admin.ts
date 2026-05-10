import "server-only";

import { requireAdminSession } from "@/lib/admin/session";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { AdminBookingAction, AdminBookingResponse, AdminBookingsResponse } from "@/lib/types/admin";

export class AdminApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AdminApiError";
    this.statusCode = statusCode;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }

    if (typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    // Ignore parse failures and use the response text fallback.
  }

  return response.statusText || "Request failed";
}

async function adminFetch(pathname: string, init?: RequestInit) {
  const session = await requireAdminSession();
  // Admin pages call the Nest API server-to-server. That keeps the web app thin and preserves
  // the backend as the only place that knows database and booking rules.
  const response = await fetch(`${getApiBaseUrl()}${pathname}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${session.adminAccessToken}`
    }
  });

  if (!response.ok) {
    throw new AdminApiError(await readErrorMessage(response), response.status);
  }

  return response;
}

export async function fetchAdminBookings(searchParams: {
  status?: string;
  date?: string;
  q?: string;
}) {
  const query = new URLSearchParams();

  if (searchParams.status) {
    query.set("status", searchParams.status);
  }

  if (searchParams.date) {
    query.set("date", searchParams.date);
  }

  if (searchParams.q) {
    query.set("q", searchParams.q);
  }

  const response = await adminFetch(
    `/admin/bookings${query.toString() ? `?${query.toString()}` : ""}`
  );

  return (await response.json()) as AdminBookingsResponse;
}

export async function fetchAdminBooking(bookingId: string) {
  const response = await adminFetch(`/admin/bookings/${bookingId}`);
  return (await response.json()) as AdminBookingResponse;
}

export async function updateAdminBookingStatus(
  bookingId: string,
  action: AdminBookingAction
) {
  const response = await adminFetch(`/admin/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action })
  });

  return (await response.json()) as AdminBookingResponse;
}
