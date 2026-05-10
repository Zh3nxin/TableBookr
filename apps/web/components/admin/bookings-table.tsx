import Link from "next/link";

import { formatAdminDate } from "@/lib/admin/format";
import { AdminBookingSummary } from "@/lib/types/admin";

import { StatusBadge } from "./status-badge";

export function BookingsTable({ bookings }: { bookings: AdminBookingSummary[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[var(--color-outline-soft)] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-outline-soft)] bg-[#fbfbfc] text-left text-sm text-[var(--color-muted)]">
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Guests</th>
              <th className="px-6 py-4 font-medium">Guest</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-[var(--color-outline-soft)] last:border-b-0"
                >
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                    {formatAdminDate(booking.bookingDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                    {booking.bookingStartTime} - {booking.bookingEndTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                    {booking.guestCount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      {booking.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-muted)]">
                    <div>{booking.customerEmail}</div>
                    <div className="mt-1">{booking.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-sm font-medium text-[var(--color-primary)] underline decoration-[rgba(1,45,29,0.28)] underline-offset-4 transition hover:decoration-[rgba(1,45,29,0.72)]"
                    >
                      Open booking
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center text-sm text-[var(--color-muted)]"
                >
                  No bookings matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
