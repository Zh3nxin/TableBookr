import { notFound } from "next/navigation";

import { BookingPageClient } from "@/components/booking/booking-flow-client";
import { ApiError, fetchPublicRestaurant } from "@/lib/api/public-booking";
import {
  BookingPageSearchParams,
  loadInitialBookingPageState
} from "@/lib/booking/initial-booking-state";

export default async function BookingPage({
  params,
  searchParams
}: {
  params: Promise<{ restaurantSlug: string }>;
  searchParams: Promise<BookingPageSearchParams>;
}) {
  const { restaurantSlug } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    const restaurant = await fetchPublicRestaurant(restaurantSlug);
    const initialBookingState = await loadInitialBookingPageState(
      restaurant,
      resolvedSearchParams
    );

    return (
      <BookingPageClient
        restaurant={restaurant}
        {...initialBookingState}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-[var(--color-page)] px-6 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-[24px] border border-[var(--color-error-soft)] bg-white p-10 shadow-[0_22px_60px_-38px_rgba(26,28,30,0.35)]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-error-strong)]">
              Booking page
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--color-text)]">
              Unable to load restaurant details
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--color-muted)]">
              Please try again later or check that the restaurant URL is correct.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
