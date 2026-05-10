import { updateBookingStatusAction } from "@/app/admin/actions";
import { AdminBookingSummary } from "@/lib/types/admin";

export function BookingActionsCard({ booking }: { booking: AdminBookingSummary }) {
  return (
    <aside className="rounded-[28px] border border-[var(--color-outline-soft)] bg-white p-7 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-primary)]">
        Actions
      </p>
      <h2 className="mt-3 text-xl font-semibold text-[var(--color-text)]">
        Manage this booking
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
        Keep changes explicit. Pending requests can be accepted or rejected.
        Confirmed and pending bookings can be canceled.
      </p>

      <form action={updateBookingStatusAction} className="mt-6 space-y-3">
        <input type="hidden" name="bookingId" value={booking.id} />

        {booking.status === "pending" ? (
          <>
            <button
              type="submit"
              name="action"
              value="accept"
              className="flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-primary)] px-5 text-sm font-medium text-white transition hover:bg-[#0d3a29]"
            >
              Accept booking
            </button>
            <button
              type="submit"
              name="action"
              value="reject"
              className="flex min-h-12 w-full items-center justify-center rounded-full border border-[#dfb7b1] bg-[#fff4f2] px-5 text-sm font-medium text-[#8a241f] transition hover:bg-[#ffece8]"
            >
              Reject booking
            </button>
          </>
        ) : null}

        {booking.status === "pending" || booking.status === "confirmed" ? (
          <button
            type="submit"
            name="action"
            value="cancel"
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--color-outline-soft)] px-5 text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[#f3f7f4]"
          >
            Cancel booking
          </button>
        ) : null}
      </form>
    </aside>
  );
}
