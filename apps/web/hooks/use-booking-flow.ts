"use client";

import {
  addTransitionType,
  FormEvent,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { useLanguage } from "@/i18n/language-provider";
import { ApiError, createBooking, fetchAvailability } from "@/lib/api/public-booking";
import {
  AvailabilitySlot,
  BookingDateOption,
  PublicRestaurantResponse
} from "@/lib/types/public-booking";

import {
  BookingConfirmationDetails,
  BookingResultState,
  BookingSummaryItem,
  ContactErrors,
  ContactValues
} from "@/components/booking/booking-types";

function getLocale(language: "da" | "en") {
  return language === "da" ? "da-DK" : "en-US";
}

function formatSpecificDate(value: string, language: "da" | "en") {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat(getLocale(language), {
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatCompactSummaryDate(
  value: string,
  timeZone: string,
  language: "da" | "en"
) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat(getLocale(language), {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function getInitialSelectedSlot(slots: AvailabilitySlot[]) {
  return (
    slots.find((slot) => slot.time === "18:30" && slot.status !== "blocked") ??
    slots.find((slot) => slot.time === "19:00" && slot.status !== "blocked") ??
    slots.find((slot) => slot.status !== "blocked") ??
    null
  );
}

function getAvailabilityCacheKey(date: string, guestCount: number) {
  return `${date}:${guestCount}`;
}

function areSlotsEqual(left: AvailabilitySlot[], right: AvailabilitySlot[]) {
  return (
    left.length === right.length &&
    left.every(
      (slot, index) =>
        slot.time === right[index]?.time && slot.status === right[index]?.status
    )
  );
}

function runBookingStepTransition(type: "booking-back" | "booking-forward", update: () => void) {
  startTransition(() => {
    addTransitionType(type);
    update();
  });
}

export function getSlotButtonClasses(
  status: AvailabilitySlot["status"],
  isSelected: boolean
) {
  if (status === "blocked") {
    return "cursor-not-allowed border-[#d7ddd8] bg-[#f3f3f6] text-[#a1a7a2]";
  }

  if (status === "pending") {
    return isSelected
      ? "border-[#9e7a2a] bg-[#f7f0dc] text-[#6e5418] shadow-sm"
      : "border-[#d9c79b] bg-[#fffaf0] text-[#6e5418] hover:border-[#b38a36]";
  }

  return isSelected
    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md"
    : "border-[var(--color-outline-soft)] bg-white text-[var(--color-text)] hover:border-[#274e3d]";
}

type UseBookingFlowParams = {
  restaurant: PublicRestaurantResponse;
  dateOptions: BookingDateOption[];
  initialDate: string;
  initialSlots: AvailabilitySlot[];
  initialGuestCount: number;
  initialSelectedTime: string | null;
  initialIsReady: boolean;
};

export function useBookingFlow({
  restaurant,
  dateOptions,
  initialDate,
  initialSlots,
  initialGuestCount,
  initialSelectedTime,
  initialIsReady
}: UseBookingFlowParams) {
  const { language, messages } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [slots, setSlots] = useState(initialSlots);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    initialSelectedTime
      ? initialSlots.find(
          (slot) => slot.time === initialSelectedTime && slot.status !== "blocked"
        ) ?? getInitialSelectedSlot(initialSlots)
      : getInitialSelectedSlot(initialSlots)
  );
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [stepReady, setStepReady] = useState(initialIsReady);
  const [contactValues, setContactValues] = useState<ContactValues>({
    name: "",
    email: "",
    phone: ""
  });
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResultState | null>(null);
  const hasSkippedInitialFetch = useRef(false);
  const selectedSlotRef = useRef<AvailabilitySlot | null>(selectedSlot);
  const availabilityCacheRef = useRef(
    new Map<string, AvailabilitySlot[]>([
      [getAvailabilityCacheKey(initialDate, initialGuestCount), initialSlots]
    ])
  );
  const dateInputRef = useRef<HTMLInputElement>(null);
  const quickDateValues = useMemo(
    () => new Set(dateOptions.map((option) => option.value)),
    [dateOptions]
  );
  const selectedDateIsSpecific = !quickDateValues.has(selectedDate);
  const contactStepActive = stepReady && !!selectedSlot;
  const primaryCtaLabel =
    selectedSlot?.status === "pending"
      ? messages.booking.sendBookingRequest
      : messages.booking.confirmBooking;

  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  useEffect(() => {
    if (!hasSkippedInitialFetch.current) {
      hasSkippedInitialFetch.current = true;
      return;
    }

    let isCancelled = false;

    function applyAvailability(nextSlots: AvailabilitySlot[]) {
      const preferredTime = selectedSlotRef.current?.time ?? null;

      setSlots((currentSlots) =>
        areSlotsEqual(currentSlots, nextSlots) ? currentSlots : nextSlots
      );
      setSelectedSlot((currentSelectedSlot) => {
        if (preferredTime) {
          const matchingSlot = nextSlots.find(
            (slot) => slot.time === preferredTime && slot.status !== "blocked"
          );

          if (matchingSlot) {
            if (
              currentSelectedSlot?.time === matchingSlot.time &&
              currentSelectedSlot.status === matchingSlot.status
            ) {
              return currentSelectedSlot;
            }

            return matchingSlot;
          }
        }

        return getInitialSelectedSlot(nextSlots);
      });
      setStepReady(false);
      setBookingResult(null);
    }

    async function loadAvailability() {
      setAvailabilityError(null);

      const cacheKey = getAvailabilityCacheKey(selectedDate, guestCount);
      const cachedSlots = availabilityCacheRef.current.get(cacheKey);

      if (cachedSlots) {
        applyAvailability(cachedSlots);
        return;
      }

      setIsLoadingSlots(true);

      try {
        const response = await fetchAvailability(restaurant.slug, {
          date: selectedDate,
          guestCount
        });

        if (!isCancelled) {
          availabilityCacheRef.current.set(cacheKey, response.slots);
          applyAvailability(response.slots);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof ApiError
              ? error.message
              : messages.booking.loadAvailabilityFallback;

          setSlots([]);
          setSelectedSlot(null);
          setAvailabilityError(message);
          setStepReady(false);
          setBookingResult(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      isCancelled = true;
    };
  }, [guestCount, messages.booking.loadAvailabilityFallback, restaurant.slug, selectedDate]);

  function formatQuickDateLabel(value: string) {
    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
      return value;
    }

    return new Intl.DateTimeFormat(getLocale(language), {
      weekday: "short",
      timeZone: restaurant.timezone
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  function syncStepQuery(nextSelection: {
    guestCount: number;
    date: string;
    time?: string | null;
    ready?: boolean;
  }) {
    const searchParams = new URLSearchParams();

    searchParams.set("guests", String(nextSelection.guestCount));
    searchParams.set("date", nextSelection.date);

    if (nextSelection.time) {
      searchParams.set("time", nextSelection.time);
    }

    if (nextSelection.ready) {
      searchParams.set("ready", "1");
    }

    router.replace(`${pathname}?${searchParams.toString()}`, { scroll: false });
  }

  function handleGuestChange(value: number) {
    setGuestCount(value);
    setStepReady(false);
    setBookingResult(null);
    setSubmissionError(null);
  }

  function handleDateChange(value: string) {
    setSelectedDate(value);
    setStepReady(false);
    setBookingResult(null);
    setSubmissionError(null);
  }

  function handleSpecificDateClick() {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  function handleSelectSlot(slot: AvailabilitySlot) {
    setSelectedSlot(slot);
    setStepReady(false);
    setBookingResult(null);
  }

  function handleContinueToContact() {
    if (!selectedSlot || selectedSlot.status === "blocked") {
      return;
    }

    runBookingStepTransition("booking-forward", () => {
      setStepReady(true);
      setBookingResult(null);
      syncStepQuery({
        guestCount,
        date: selectedDate,
        time: selectedSlot.time,
        ready: true
      });
    });
  }

  function handleContactValueChange(field: keyof ContactValues, value: string) {
    setContactValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));
    setContactErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined
    }));
    setSubmissionError(null);
  }

  function validateContactValues() {
    const nextErrors: ContactErrors = {};

    if (!contactValues.name.trim()) {
      nextErrors.name = messages.booking.validation.nameRequired;
    }

    if (!contactValues.email.trim()) {
      nextErrors.email = messages.booking.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValues.email.trim())) {
      nextErrors.email = messages.booking.validation.emailInvalid;
    }

    if (!contactValues.phone.trim()) {
      nextErrors.phone = messages.booking.validation.phoneRequired;
    }

    setContactErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSlot || !validateContactValues()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const response = await createBooking(restaurant.slug, {
        guestCount,
        date: selectedDate,
        time: selectedSlot.time,
        name: contactValues.name.trim(),
        email: contactValues.email.trim(),
        phone: contactValues.phone.trim()
      });

      setBookingResult(response);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : messages.booking.submitBookingFallback;

      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToDetails() {
    runBookingStepTransition("booking-back", () => {
      setStepReady(false);
      setBookingResult(null);
      setSubmissionError(null);
      syncStepQuery({
        guestCount,
        date: selectedDate,
        time: selectedSlot?.time ?? null
      });
    });
  }

  function handleResetAfterResult() {
    runBookingStepTransition("booking-back", () => {
      setBookingResult(null);
      setSubmissionError(null);
      setStepReady(false);
      syncStepQuery({
        guestCount,
        date: selectedDate,
        time: selectedSlot?.time ?? null
      });
    });
  }

  const summaryItems: BookingSummaryItem[] = selectedSlot
    ? [
        {
          kind: "date",
          label: formatCompactSummaryDate(selectedDate, restaurant.timezone, language)
        },
        {
          kind: "time",
          label: selectedSlot.time
        },
        {
          kind: "guests",
          label: messages.formatters.guests(guestCount)
        }
      ]
    : [];

  const confirmationDetails: BookingConfirmationDetails = {
    bookingId: bookingResult?.bookingId,
    dateLabel: formatCompactSummaryDate(selectedDate, restaurant.timezone, language),
    timeLabel: selectedSlot?.time ?? "",
    guestsLabel: messages.formatters.guests(guestCount),
    durationLabel: messages.formatters.duration(restaurant.bookingDurationMinutes)
  };

  return {
    contactErrors,
    contactStepActive,
    contactValues,
    dateInputRef,
    availabilityError,
    bookingResult,
    confirmationDetails,
    formatQuickDateLabel,
    formatSpecificDate: (value: string) => formatSpecificDate(value, language),
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
  };
}
