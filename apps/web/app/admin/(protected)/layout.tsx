import Link from "next/link";
import { ReactNode } from "react";

import { logoutAdminAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin/session";

export default async function ProtectedAdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <header className="border-b border-[var(--color-outline-soft)] bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Table Bookr
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/admin/bookings"
                className="text-lg font-semibold text-[var(--color-text)]"
              >
                {session.user.restaurantName}
              </Link>
              <span className="text-sm text-[var(--color-muted)]">
                Staff bookings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-[var(--color-muted)] sm:block">
              {session.user.name}
            </p>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="rounded-full border border-[var(--color-outline-soft)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[#f3f7f4]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
