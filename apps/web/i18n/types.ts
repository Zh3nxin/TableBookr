export type Language = "da" | "en";

export type Messages = {
  common: {
    help: string;
    languageLabel: string;
    languageDa: string;
    languageEn: string;
    footerPrivacy: string;
    footerTerms: string;
    footerContact: string;
    footerCopyright: string;
  };
  booking: {
    title: string;
    steps: {
      reservation: string;
      contact: string;
    };
    guestsLabel: string;
    guestSelectorLabel: string;
    selectDate: string;
    specificDate: string;
    availableTimes: string;
    noTimesAvailable: string;
    updatingTimes: string;
    continueToContact: string;
    back: string;
    contactTitle: string;
    contactSubtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    confirmBooking: string;
    sendBookingRequest: string;
    submitting: string;
    bookingTermsPrefix: string;
    bookingTermsLink: string;
    loadAvailabilityFallback: string;
    submitBookingFallback: string;
    validation: {
      nameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      phoneRequired: string;
    };
    confirmation: {
      confirmedTitle: string;
      pendingTitle: string;
      blockedTitle: string;
      confirmedMessage: string;
      pendingMessage: string;
      blockedMessage: string;
      bookingId: string;
      date: string;
      time: string;
      guests: string;
      duration: string;
      bookAnother: string;
      returnHome: string;
    };
  };
  formatters: {
    guests: (count: number) => string;
    duration: (minutes: number) => string;
  };
};
