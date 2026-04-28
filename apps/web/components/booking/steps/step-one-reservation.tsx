"use client";

import { RefObject } from "react";

import { useLanguage } from "@/i18n/language-provider";
import { AvailabilitySlot, BookingDateOption } from "@/lib/types/public-booking";

import {
  ArrowRightIcon,
  CalendarIcon,
  ChevronDownIcon
} from "../icons";

const GUEST_BUTTON_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const GUEST_SELECTOR_VALUES = [10, 11, 12, 13, 14, 15, 16];

export function StepOneReservation({
  guestCount,
  selectedDate,
  selectedDateIsSpecific,
  dateOptions,
  slots,
  selectedSlot,
  availabilityError,
  isLoadingSlots,
  dateInputRef,
  formatSpecificDate,
  formatQuickDateLabel,
  getSlotButtonClasses,
  onGuestChange,
  onDateChange,
  onSpecificDateClick,
  onSelectSlot,
  onContinue
}: {
  guestCount: number;
  selectedDate: string;
  selectedDateIsSpecific: boolean;
  dateOptions: BookingDateOption[];
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  availabilityError: string | null;
  isLoadingSlots: boolean;
  dateInputRef: RefObject<HTMLInputElement | null>;
  formatSpecificDate: (value: string) => string;
  formatQuickDateLabel: (value: string) => string;
  getSlotButtonClasses: (
    status: AvailabilitySlot["status"],
    isSelected: boolean
  ) => string;
  onGuestChange: (value: number) => void;
  onDateChange: (value: string) => void;
  onSpecificDateClick: () => void;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  onContinue: () => void;
}) {
  const { messages } = useLanguage();

  return (
    <div className="space-y-6 p-8">
      <section>
        <label className="mb-4 block text-[14px] font-medium text-[var(--color-muted)]">
          {messages.booking.guestsLabel}
        </label>
        <div className="grid grid-cols-5 gap-2 pb-2 sm:[grid-template-columns:repeat(9,minmax(0,1fr))_1.45fr]">
          {GUEST_BUTTON_VALUES.map((value) => {
            const isSelected = guestCount === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => onGuestChange(value)}
                className={`flex h-10 w-full items-center justify-center rounded-full border-2 px-3 text-[14px] font-medium transition-colors ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-outline-soft)] bg-white text-[#586062] hover:border-[#1b4332]"
                }`}
              >
                {value}
              </button>
            );
          })}
          <div
            className={`relative flex h-10 w-full items-center rounded-full border-2 pl-4 pr-10 text-[14px] font-medium transition-colors ${
              guestCount >= 10
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-outline-soft)] bg-white text-[#586062] hover:border-[#1b4332]"
            }`}
          >
            <select
              aria-label={messages.booking.guestSelectorLabel}
              value={guestCount >= 10 ? String(guestCount) : ""}
              onChange={(event) => onGuestChange(Number(event.target.value))}
              className="absolute inset-0 h-full w-full appearance-none rounded-full opacity-0"
            >
              <option value="" disabled>
                10+
              </option>
              {GUEST_SELECTOR_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <span aria-hidden="true">{guestCount >= 10 ? guestCount : "10+"}</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            >
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <label className="block text-[14px] font-medium text-[var(--color-muted)]">
            {messages.booking.selectDate}
          </label>
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              className="pointer-events-none absolute h-0 w-0 opacity-0"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={onSpecificDateClick}
              className={`inline-flex h-10 w-[168px] items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-[14px] font-medium leading-none transition-all ${
                selectedDateIsSpecific
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-outline)] text-[var(--color-primary)] hover:bg-[var(--color-primary-fixed)]"
              }`}
            >
              <CalendarIcon />
              {selectedDateIsSpecific
                ? formatSpecificDate(selectedDate)
                : messages.booking.specificDate}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pb-1 sm:grid-cols-7">
          {dateOptions.map((option) => {
            const isSelected = option.value === selectedDate;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onDateChange(option.value)}
                className={`flex w-full flex-col items-center justify-center rounded-xl border-2 py-3 transition-colors ${
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                    : "border-[var(--color-outline-soft)] bg-white text-[#586062] hover:border-[#1b4332]"
                }`}
              >
                <span className="text-[10px] font-semibold uppercase opacity-70">
                  {formatQuickDateLabel(option.value)}
                </span>
                <span className="text-[24px] font-semibold leading-[1.3]">
                  {option.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <label className="mb-4 block text-[14px] font-medium text-[var(--color-muted)]">
          {messages.booking.availableTimes}
        </label>

        {!availabilityError && slots.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.time === slot.time;

              return (
                <button
                  key={`${slot.time}-${slot.status}`}
                  type="button"
                  disabled={slot.status === "blocked"}
                  onClick={() => onSelectSlot(slot)}
                  className={`rounded-lg border py-3 text-[14px] font-medium transition-all ${getSlotButtonClasses(
                    slot.status,
                    isSelected
                  )}`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        ) : null}

        {availabilityError ? (
          <div className="rounded-lg border border-[var(--color-error-soft)] bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error-strong)]">
            {availabilityError}
          </div>
        ) : null}

        {!availabilityError && slots.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-outline-soft)] bg-[#f3f3f6] px-4 py-3 text-sm text-[var(--color-muted)]">
            {messages.booking.noTimesAvailable}
          </div>
        ) : null}

        {isLoadingSlots ? (
          <p className="mt-3 text-[13px] text-[var(--color-muted)]">
            {messages.booking.updatingTimes}
          </p>
        ) : null}
      </section>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!selectedSlot || selectedSlot.status === "blocked"}
          onClick={onContinue}
          className="inline-flex h-[52px] items-center gap-2 rounded-lg bg-[var(--color-primary)] px-10 text-[15px] font-medium text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#8aa497]"
        >
          {messages.booking.continueToContact}
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}
