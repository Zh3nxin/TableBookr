"use client";

import { ViewTransition } from "react";

import {
  AvailabilitySlot,
  BookingDateOption,
  PublicRestaurantResponse
} from "@/lib/types/public-booking";
import { getSlotButtonClasses, useBookingFlow } from "@/hooks/use-booking-flow";

import { BookingLayout } from "./booking-layout";
import { HelpIcon } from "./icons";
import { LanguageSwitcher } from "./language-switcher";
import { StepOneReservation } from "./steps/step-one-reservation";
import { StepTwoContact } from "./steps/step-two-contact";

export function BookingPageClient({
  restaurant,
  dateOptions,
  initialDate,
  initialSlots,
  initialGuestCount,
  initialSelectedTime,
  initialIsReady
}: {
  restaurant: PublicRestaurantResponse;
  dateOptions: BookingDateOption[];
  initialDate: string;
  initialSlots: AvailabilitySlot[];
  initialGuestCount: number;
  initialSelectedTime: string | null;
  initialIsReady: boolean;
}) {
  const {
    availabilityError,
    bookingResult,
    confirmationDetails,
    contactErrors,
    contactStepActive,
    contactValues,
    dateInputRef,
    formatQuickDateLabel,
    formatSpecificDate,
    guestCount,
    handleBackToDetails,
    handleContactValueChange,
    handleContinueToContact,
    handleDateChange,
    handleGuestChange,
    handleResetAfterResult,
    handleSelectSlot,
    handleSpecificDateClick,
    handleSubmitBooking,
    isLoadingSlots,
    isSubmitting,
    messages,
    primaryCtaLabel,
    selectedDate,
    selectedDateIsSpecific,
    selectedSlot,
    slots,
    submissionError,
    summaryItems
  } = useBookingFlow({
    restaurant,
    dateOptions,
    initialDate,
    initialSlots,
    initialGuestCount,
    initialSelectedTime,
    initialIsReady
  });

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-page)] text-[var(--color-text)]">
      <header className="fixed top-0 z-50 w-full border-b border-[#eef2ef] bg-white shadow-[0_1px_8px_rgba(148,163,184,0.12)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-[12px] font-bold uppercase tracking-[0.26em] text-[#0f2e20]">
            {restaurant.name}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#66707a] transition-colors hover:text-[#1f3f31]"
            >
              <HelpIcon />
              <span className="hidden md:inline">{messages.common.help}</span>
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main
        className={`mt-8 flex flex-grow flex-col items-center px-6 pb-24 ${
          contactStepActive ? "justify-start py-12" : "justify-start pt-12"
        }`}
      >
        <ViewTransition
          default={{
            default: "none",
            "booking-back": "slide-back",
            "booking-forward": "slide-forward"
          }}
        >
          <div className="mb-4 w-full max-w-3xl text-center">
            <h1 className="mb-2 text-[32px] font-semibold tracking-[-0.02em] text-[var(--color-primary)]">
              {messages.booking.title}
            </h1>
          </div>

          {contactStepActive ? (
            <BookingLayout
              activeStep={2}
              headerAction={
                <button
                  type="button"
                  onClick={handleBackToDetails}
                  className="inline-flex items-center text-[11px] font-normal text-[#7d8781] transition-colors hover:text-[var(--color-primary)]"
                >
                  <span>{messages.booking.back}</span>
                </button>
              }
            >
              <StepTwoContact
                bookingResult={bookingResult}
                confirmationDetails={confirmationDetails}
                summaryItems={summaryItems}
                contactValues={contactValues}
                contactErrors={contactErrors}
                submissionError={submissionError}
                isSubmitting={isSubmitting}
                primaryCtaLabel={primaryCtaLabel}
                onSubmit={handleSubmitBooking}
                onResetAfterResult={handleResetAfterResult}
                onContactValueChange={handleContactValueChange}
              />
            </BookingLayout>
          ) : (
            <BookingLayout activeStep={1}>
              <StepOneReservation
                guestCount={guestCount}
                selectedDate={selectedDate}
                selectedDateIsSpecific={selectedDateIsSpecific}
                dateOptions={dateOptions}
                slots={slots}
                selectedSlot={selectedSlot}
                availabilityError={availabilityError}
                isLoadingSlots={isLoadingSlots}
                dateInputRef={dateInputRef}
                formatSpecificDate={formatSpecificDate}
                formatQuickDateLabel={formatQuickDateLabel}
                getSlotButtonClasses={getSlotButtonClasses}
                onGuestChange={handleGuestChange}
                onDateChange={handleDateChange}
                onSpecificDateClick={handleSpecificDateClick}
                onSelectSlot={handleSelectSlot}
                onContinue={handleContinueToContact}
              />
            </BookingLayout>
          )}
        </ViewTransition>
      </main>

      <footer className="mt-auto w-full border-t border-[#eef2ef] bg-white text-sm text-[#6b7280]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-8 py-10 md:flex-row">
          <div className="text-lg font-bold text-[#0f2e20]">Table Bookr</div>

          <div className="flex flex-wrap justify-center gap-6 text-[12px]">
            <a href="#" className="transition-colors hover:text-[#1f3f31]">
              {messages.common.footerPrivacy}
            </a>
            <a href="#" className="transition-colors hover:text-[#1f3f31]">
              {messages.common.footerTerms}
            </a>
            <a href="#" className="transition-colors hover:text-[#1f3f31]">
              {messages.common.footerContact}
            </a>
          </div>

          <div className="text-[12px]">{messages.common.footerCopyright}</div>
        </div>
      </footer>
    </div>
  );
}
