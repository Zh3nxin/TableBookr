"use client";

import { ReactNode } from "react";

import { useLanguage } from "@/i18n/language-provider";

export function BookingLayout({
  activeStep,
  headerAction,
  children
}: {
  activeStep: 1 | 2;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  const { messages } = useLanguage();

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--color-outline-soft)] bg-white shadow-sm">
      <div className="relative flex items-center justify-center border-b border-[#e2e2e5] bg-[#f9f9fc] p-6">
        {headerAction ? <div className="absolute left-8 top-5">{headerAction}</div> : null}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-[14px] font-medium text-white">
              1
            </span>
            <span className="text-[14px] font-medium text-[var(--color-primary)]">
              {messages.booking.steps.reservation}
            </span>
          </div>
          <div
            className={`h-[2px] w-12 ${
              activeStep === 2 ? "bg-[var(--color-primary)]" : "bg-[var(--color-outline-soft)]"
            }`}
          />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-medium ${
                activeStep === 2
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-outline-soft)] bg-[#e8e8ea] text-[var(--color-muted)]"
              }`}
            >
              2
            </span>
            <span
              className={`text-[14px] font-medium ${
                activeStep === 2 ? "text-[var(--color-primary)]" : "text-[#586062]"
              }`}
            >
              {messages.booking.steps.contact}
            </span>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
