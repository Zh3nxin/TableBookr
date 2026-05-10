import Link from "next/link";

import { AdminBookingListStatusFilter } from "@/lib/types/admin";

const STATUS_OPTIONS: Array<{
  value: AdminBookingListStatusFilter;
  label: string;
}> = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "canceled", label: "Canceled" },
  { value: "all", label: "All statuses" }
];

export function BookingsFilters({
  status,
  date,
  q
}: {
  status: AdminBookingListStatusFilter;
  date: string;
  q: string;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--color-outline-soft)] bg-white p-6 shadow-sm">
      <form className="grid gap-4 md:grid-cols-[180px_180px_minmax(0,1fr)_auto_auto] md:items-end">
        <label className="space-y-2 text-sm text-[var(--color-muted)]">
          <span className="block font-medium text-[var(--color-text)]">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-2xl border border-[var(--color-outline-soft)] bg-white px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-[var(--color-muted)]">
          <span className="block font-medium text-[var(--color-text)]">Date</span>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="w-full rounded-2xl border border-[var(--color-outline-soft)] bg-white px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--color-muted)]">
          <span className="block font-medium text-[var(--color-text)]">Search</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Name, email, or phone"
            className="w-full rounded-2xl border border-[var(--color-outline-soft)] bg-white px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </label>

        <button
          type="submit"
          className="min-h-12 rounded-full bg-[var(--color-primary)] px-5 text-sm font-medium text-white transition hover:bg-[#0d3a29]"
        >
          Apply filters
        </button>

        <Link
          href="/admin/bookings"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-outline-soft)] px-5 text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[#f3f7f4]"
        >
          Reset
        </Link>
      </form>
    </div>
  );
}
