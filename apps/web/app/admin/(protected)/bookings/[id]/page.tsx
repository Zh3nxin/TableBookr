import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingActionsCard } from "@/components/admin/booking-actions-card";
import { BookingDetailCard } from "@/components/admin/booking-detail-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminApiError, fetchAdminBooking } from "@/lib/api/admin";

function readString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function getStatusMessage(updated: string) {
  if (updated === "accept") {
    return "Booking accepted.";
  }

  if (updated === "reject") {
    return "Booking rejected.";
  }

  if (updated === "cancel") {
    return "Booking canceled.";
  }

  return "";
}

export default async function AdminBookingDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const errorMessage = readString(resolvedSearchParams.error);
  const updatedMessage = getStatusMessage(readString(resolvedSearchParams.updated));

  try {
    const { booking } = await fetchAdminBooking(id);

    return (
      <section className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Link
              href="/admin/bookings"
              className="inline-flex text-sm font-medium text-[var(--color-primary)] underline decoration-[rgba(1,45,29,0.24)] underline-offset-4"
            >
              Back to bookings
            </Link>
            <h1 className="text-3xl font-semibold text-[var(--color-text)]">
              {booking.customerName}
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Booking {booking.id}
            </p>
          </div>

          <StatusBadge status={booking.status} />
        </div>

        {updatedMessage ? (
          <p className="rounded-[22px] border border-[#b7d8c3] bg-[#eef8f1] px-5 py-4 text-sm text-[#184d34]">
            {updatedMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-[22px] border border-[var(--color-error-soft)] bg-[var(--color-error-bg)] px-5 py-4 text-sm text-[var(--color-error-strong)]">
            {errorMessage}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <BookingDetailCard booking={booking} />
          <BookingActionsCard booking={booking} />
        </div>
      </section>
    );
  } catch (error) {
    if (error instanceof AdminApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}
