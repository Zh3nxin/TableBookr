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
import { usePathname } from "next/navigation";

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

function getAvailabilityCacheKey(date: string) {
  return date;
}

function parseGuestCountParam(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 16) {
    return fallback;
  }

  return parsedValue;
}

function parseDateParam(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

function parseTimeParam(value: string | null) {
  if (!value) {
    return null;
  }

  return /^\d{2}:\d{2}$/.test(value) ? value : null;
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

function findSelectableSlot(slots: AvailabilitySlot[], time: string | null) {
  if (!time) {
    return null;
  }

  return slots.find((slot) => slot.time === time && slot.status !== "blocked") ?? null;
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
  const pathname = usePathname();
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [slots, setSlots] = useState(initialSlots);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    findSelectableSlot(initialSlots, initialSelectedTime)
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
  const preferredTimeRef = useRef<string | null>(initialSelectedTime);
  const availabilityCacheRef = useRef(
    new Map<string, AvailabilitySlot[]>(
      initialSlots.length > 0 ? [[getAvailabilityCacheKey(initialDate), initialSlots]] : []
    )
  );
  const inFlightAvailabilityRef = useRef(new Map<string, Promise<AvailabilitySlot[]>>());
  const pendingHistoryMethodRef = useRef<"push" | "replace">("replace");
  const didPushContactStepRef = useRef(false);
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

  async function loadAvailabilityForDate(date: string) {
    const cacheKey = getAvailabilityCacheKey(date);
    const cachedSlots = availabilityCacheRef.current.get(cacheKey);

    if (cachedSlots) {
      return cachedSlots;
    }

    const inFlightRequest = inFlightAvailabilityRef.current.get(cacheKey);

    if (inFlightRequest) {
      return inFlightRequest;
    }

    const request = fetchAvailability(restaurant.slug, {
      date,
      guestCount: 1
    })
      .then((response) => {
        availabilityCacheRef.current.set(cacheKey, response.slots);
        return response.slots;
      })
      .finally(() => {
        inFlightAvailabilityRef.current.delete(cacheKey);
      });

    inFlightAvailabilityRef.current.set(cacheKey, request);

    return request;
  }

  useEffect(() => {
    const searchParams = new URLSearchParams();

    searchParams.set("guests", String(guestCount));
    searchParams.set("date", selectedDate);

    if (selectedSlot?.time) {
      searchParams.set("time", selectedSlot.time);
    }

    if (stepReady) {
      searchParams.set("ready", "1");
    }

    const nextQuery = searchParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl === nextUrl) {
      pendingHistoryMethodRef.current = "replace";
      return;
    }

    const historyState = { bookingFlow: true, ready: stepReady };

    if (pendingHistoryMethodRef.current === "push") {
      window.history.pushState(historyState, "", nextUrl);
    } else {
      window.history.replaceState(historyState, "", nextUrl);
    }

    pendingHistoryMethodRef.current = "replace";
  }, [guestCount, pathname, selectedDate, selectedSlot?.time, stepReady]);

  useEffect(() => {
    function handlePopState() {
      const searchParams = new URLSearchParams(window.location.search);
      const nextGuestCount = parseGuestCountParam(
        searchParams.get("guests"),
        initialGuestCount
      );
      const nextDate = parseDateParam(searchParams.get("date"), initialDate);
      const nextTime = parseTimeParam(searchParams.get("time"));
      const nextStepReady = searchParams.get("ready") === "1";
      const cachedSlots = availabilityCacheRef.current.get(getAvailabilityCacheKey(nextDate));

      preferredTimeRef.current = nextTime;

      setGuestCount(nextGuestCount);
      setSelectedDate(nextDate);
      setStepReady(nextStepReady);
      setBookingResult(null);
      setSubmissionError(null);
      setContactErrors({});

      if (cachedSlots) {
        setSlots(cachedSlots);
        setIsLoadingSlots(false);
        setAvailabilityError(null);
        setSelectedSlot(findSelectableSlot(cachedSlots, nextTime));
      } else {
        setSelectedSlot(null);
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [initialDate, initialGuestCount]);

  useEffect(() => {
    let isCancelled = false;

    function applyAvailability(nextSlots: AvailabilitySlot[]) {
      const preferredTime = preferredTimeRef.current;
      const matchingSlot = findSelectableSlot(nextSlots, preferredTime);

      setSlots((currentSlots) =>
        areSlotsEqual(currentSlots, nextSlots) ? currentSlots : nextSlots
      );
      setSelectedSlot(matchingSlot);

      if (preferredTime && !matchingSlot) {
        setStepReady(false);
      }
    }

    async function loadSelectedDateAvailability() {
      const cachedSlots = availabilityCacheRef.current.get(
        getAvailabilityCacheKey(selectedDate)
      );

      setAvailabilityError(null);

      if (cachedSlots) {
        applyAvailability(cachedSlots);
        setIsLoadingSlots(false);
        return;
      }

      setIsLoadingSlots(true);
      try {
        const nextSlots = await loadAvailabilityForDate(selectedDate);

        if (!isCancelled) {
          applyAvailability(nextSlots);
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

    void loadSelectedDateAvailability();

    return () => {
      isCancelled = true;
    };
  }, [messages.booking.loadAvailabilityFallback, restaurant.slug, selectedDate]);

  useEffect(() => {
    for (const option of dateOptions) {
      if (option.value === selectedDate) {
        continue;
      }

      void loadAvailabilityForDate(option.value).catch(() => {
        // Background prefetch failures should not interrupt the active date.
      });
    }
  }, [dateOptions, restaurant.slug, selectedDate]);

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

  function handleGuestChange(value: number) {
    preferredTimeRef.current = null;
    setGuestCount(value);
    setSelectedSlot(null);
    setStepReady(false);
    setBookingResult(null);
    setSubmissionError(null);
  }

  function handleDateChange(value: string) {
    if (value === selectedDate) {
      return;
    }

    preferredTimeRef.current = null;
    setSelectedDate(value);
    setSelectedSlot(null);
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
    preferredTimeRef.current = slot.time;
    setSelectedSlot(slot);
    setStepReady(false);
    setBookingResult(null);
  }

  function handleContinueToContact() {
    if (!selectedSlot || selectedSlot.status === "blocked") {
      return;
    }

    pendingHistoryMethodRef.current = "push";
    didPushContactStepRef.current = true;

    runBookingStepTransition("booking-forward", () => {
      setStepReady(true);
      setBookingResult(null);
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
    if (didPushContactStepRef.current) {
      didPushContactStepRef.current = false;

      runBookingStepTransition("booking-back", () => {
        window.history.back();
      });

      return;
    }

    runBookingStepTransition("booking-back", () => {
      setStepReady(false);
      setBookingResult(null);
      setSubmissionError(null);
    });
  }

  function handleResetAfterResult() {
    if (didPushContactStepRef.current) {
      didPushContactStepRef.current = false;

      runBookingStepTransition("booking-back", () => {
        window.history.back();
      });

      return;
    }

    runBookingStepTransition("booking-back", () => {
      setBookingResult(null);
      setSubmissionError(null);
      setStepReady(false);
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
