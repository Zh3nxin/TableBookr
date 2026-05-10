import { formatAdminCreatedAt, formatAdminDate, formatAdminStatusLabel } from "@/lib/admin/format";
import { AdminBookingSummary } from "@/lib/types/admin";

export function BookingDetailCard({ booking }: { booking: AdminBookingSummary }) {
  return (
    <div className="rounded-[28px] border border-[var(--color-outline-soft)] bg-white p-7 shadow-sm">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Status</p>
          <p className="mt-2 text-base text-[var(--color-text)]">
            {formatAdminStatusLabel(booking.status)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Guests</p>
          <p className="mt-2 text-base text-[var(--color-text)]">{booking.guestCount}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Date</p>
          <p className="mt-2 text-base text-[var(--color-text)]">
            {formatAdminDate(booking.bookingDate)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Time</p>
          <p className="mt-2 text-base text-[var(--color-text)]">
            {booking.bookingStartTime} - {booking.bookingEndTime}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Email</p>
          <p className="mt-2 text-base text-[var(--color-text)]">{booking.customerEmail}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Phone</p>
          <p className="mt-2 text-base text-[var(--color-text)]">{booking.customerPhone}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Source</p>
          <p className="mt-2 text-base text-[var(--color-text)]">Website</p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">Created</p>
          <p className="mt-2 text-base text-[var(--color-text)]">
            {formatAdminCreatedAt(booking.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
