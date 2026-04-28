"use client";

import { useLanguage } from "@/i18n/language-provider";
import { BookingCreationStatus } from "@/lib/types/public-booking";

import {
  BookingConfirmationDetails,
  BookingResultState
} from "../booking-types";
import { CheckIcon } from "../icons";

function ConfirmationTitle({
  status,
  confirmedTitle,
  pendingTitle,
  blockedTitle
}: {
  status: BookingCreationStatus;
  confirmedTitle: string;
  pendingTitle: string;
  blockedTitle: string;
}) {
  if (status === "confirmed") {
    return confirmedTitle;
  }

  if (status === "pending") {
    return pendingTitle;
  }

  return blockedTitle;
}

function ConfirmationMessage({
  status,
  confirmedMessage,
  pendingMessage,
  blockedMessage
}: {
  status: BookingCreationStatus;
  confirmedMessage: string;
  pendingMessage: string;
  blockedMessage: string;
}) {
  if (status === "confirmed") {
    return confirmedMessage;
  }

  if (status === "pending") {
    return pendingMessage;
  }

  return blockedMessage;
}

export function StepThreeConfirmation({
  bookingResult,
  details,
  onResetAfterResult
}: {
  bookingResult: BookingResultState;
  details: BookingConfirmationDetails;
  onResetAfterResult: () => void;
}) {
  const { messages } = useLanguage();
  const isBlocked = bookingResult.status === "blocked";

  return (
    <div className="px-8 pb-8 pt-8">
      <div className="mx-auto max-w-[440px] text-center">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isBlocked
              ? "bg-[var(--color-error-bg)] text-[var(--color-error-strong)]"
              : "bg-[rgba(1,45,29,0.08)] text-[var(--color-primary)]"
          }`}
        >
          {isBlocked ? (
            <span className="text-[30px] font-semibold">!</span>
          ) : (
            <span className="[&>svg]:h-7 [&>svg]:w-7">
              <CheckIcon />
            </span>
          )}
        </div>

        <h2 className="text-[32px] font-semibold tracking-[-0.02em] text-[var(--color-text)]">
          <ConfirmationTitle
            status={bookingResult.status}
            confirmedTitle={messages.booking.confirmation.confirmedTitle}
            pendingTitle={messages.booking.confirmation.pendingTitle}
            blockedTitle={messages.booking.confirmation.blockedTitle}
          />
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[var(--color-muted)]">
          <ConfirmationMessage
            status={bookingResult.status}
            confirmedMessage={messages.booking.confirmation.confirmedMessage}
            pendingMessage={messages.booking.confirmation.pendingMessage}
            blockedMessage={messages.booking.confirmation.blockedMessage}
          />
        </p>

        <div className="mt-6 rounded-lg border border-[var(--color-outline-soft)] bg-[var(--color-surface-muted)] p-4 text-left">
          {details.bookingId ? (
            <div className="mb-4 flex items-center justify-between border-b border-[rgba(193,200,194,0.6)] pb-3">
              <span className="text-[13px] font-medium text-[var(--color-muted)]">
                {messages.booking.confirmation.bookingId}
              </span>
              <span className="text-[13px] font-semibold text-[var(--color-text)]">
                {details.bookingId}
              </span>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                {messages.booking.confirmation.date}
              </span>
              <span className="text-[14px] text-[var(--color-text)]">{details.dateLabel}</span>
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                {messages.booking.confirmation.time}
              </span>
              <span className="text-[14px] text-[var(--color-text)]">{details.timeLabel}</span>
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                {messages.booking.confirmation.guests}
              </span>
              <span className="text-[14px] text-[var(--color-text)]">{details.guestsLabel}</span>
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                {messages.booking.confirmation.duration}
              </span>
              <span className="text-[14px] text-[var(--color-text)]">
                {details.durationLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onResetAfterResult}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
          >
            {messages.booking.confirmation.bookAnother}
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-primary)] px-6 text-[15px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[rgba(1,45,29,0.04)] sm:w-auto"
          >
            {messages.booking.confirmation.returnHome}
          </a>
        </div>
      </div>
    </div>
  );
}
