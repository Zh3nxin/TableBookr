import {
  AvailabilityRequest,
  AvailabilityResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  PublicRestaurantResponse
} from "../types/public-booking";
import { getApiBaseUrl } from "./base-url";

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
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
    // Ignore JSON parsing failures and fall back to the status message.
  }

  return response.statusText || "Request failed";
}

export async function fetchPublicRestaurant(
  restaurantSlug: string
): Promise<PublicRestaurantResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/public/restaurants/${restaurantSlug}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as PublicRestaurantResponse;
}

export async function fetchAvailability(
  restaurantSlug: string,
  payload: AvailabilityRequest
): Promise<AvailabilityResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/public/restaurants/${restaurantSlug}/availability`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as AvailabilityResponse;
}

export async function createBooking(
  restaurantSlug: string,
  payload: CreateBookingRequest
): Promise<CreateBookingResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}/public/restaurants/${restaurantSlug}/bookings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as CreateBookingResponse;
}
