"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AdminLoginActionState, loginAdminAction } from "@/app/admin/actions";

const initialState: AdminLoginActionState = {
  error: null
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-primary)] px-6 text-sm font-medium text-white transition hover:bg-[#0d3a29] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAdminAction, initialState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--color-text)]" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-2xl border border-[var(--color-outline-soft)] bg-white px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[#cfe2d5]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--color-text)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-2xl border border-[var(--color-outline-soft)] bg-white px-4 py-3 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[#cfe2d5]"
        />
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-[var(--color-error-soft)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-strong)]">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
