import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.adminUserId && session.adminAccessToken) {
    redirect("/admin/bookings");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[28px] border border-[var(--color-outline-soft)] bg-white p-8 shadow-[0_24px_70px_-44px_rgba(26,28,30,0.35)] sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Table Bookr Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-text)]">
          Staff sign in
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Keep this page simple. Sign in to review incoming bookings and manage
          requests for the restaurant.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
