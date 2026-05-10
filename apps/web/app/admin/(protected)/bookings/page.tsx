import { BookingsFilters } from "@/components/admin/bookings-filters";
import { BookingsTable } from "@/components/admin/bookings-table";
import { fetchAdminBookings } from "@/lib/api/admin";
import { AdminBookingListStatusFilter } from "@/lib/types/admin";

function readString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const status = (readString(resolvedSearchParams.status) ||
    "active") as AdminBookingListStatusFilter;
  const date = readString(resolvedSearchParams.date);
  const q = readString(resolvedSearchParams.q);
  const { bookings } = await fetchAdminBookings({ status, date, q });

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-primary)]">
          Bookings
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text)]">
          Upcoming service overview
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
          Review incoming requests, keep an eye on tonight&apos;s flow, and open a
          booking when a guest needs a decision.
        </p>
      </div>
      <BookingsFilters status={status} date={date} q={q} />
      <BookingsTable bookings={bookings} />
    </section>
  );
}
