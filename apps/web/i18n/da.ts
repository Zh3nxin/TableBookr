import { Messages } from "./types";

export const da: Messages = {
  common: {
    help: "Hjælp",
    languageLabel: "Sprog",
    languageDa: "DA",
    languageEn: "EN",
    footerPrivacy: "Privatlivspolitik",
    footerTerms: "Handelsbetingelser",
    footerContact: "Kontakt",
    footerCopyright: "© 2024 Table Bookr. Alle rettigheder forbeholdes."
  },
  booking: {
    title: "Book dit bord",
    steps: {
      reservation: "Reservation",
      contact: "Kontakt"
    },
    guestsLabel: "Antal gæster",
    guestSelectorLabel: "Vælg antal gæster fra 10 til 16",
    selectDate: "Vælg dato",
    specificDate: "Specifik dato",
    availableTimes: "Ledige tider",
    noTimesAvailable: "Ingen ledige tider på denne dato.",
    updatingTimes: "Opdaterer tider...",
    continueToContact: "Fortsæt til kontakt",
    back: "<- Tilbage",
    contactTitle: "Kontaktoplysninger",
    contactSubtitle: "Indtast dine oplysninger for at bekræfte din reservation.",
    fullName: "Fulde navn",
    fullNamePlaceholder: "Indtast dit fulde navn",
    email: "E-mail",
    emailPlaceholder: "email@eksempel.dk",
    phone: "Telefonnummer",
    phonePlaceholder: "+45 12 34 56 78",
    confirmBooking: "Bekræft booking",
    sendBookingRequest: "Send bookingforespørgsel",
    submitting: "Sender...",
    bookingTermsPrefix: "Ved at klikke på bekræft accepterer du vores",
    bookingTermsLink: "bookingsbetingelser",
    loadAvailabilityFallback: "Kunne ikke hente bookingtider lige nu.",
    submitBookingFallback: "Kunne ikke gennemføre din booking lige nu.",
    validation: {
      nameRequired: "Fulde navn er påkrævet.",
      emailRequired: "E-mail er påkrævet.",
      emailInvalid: "Indtast en gyldig e-mailadresse.",
      phoneRequired: "Telefonnummer er påkrævet."
    },
    confirmation: {
      confirmedTitle: "Booking bekræftet",
      pendingTitle: "Bookingforespørgsel sendt",
      blockedTitle: "Tidspunkt utilgængeligt",
      confirmedMessage:
        "Din reservation er bekræftet. Vi glæder os til at byde dig velkommen.",
      pendingMessage:
        "Din bookingforespørgsel er sendt til restauranten og afventer bekræftelse.",
      blockedMessage:
        "Dette tidspunkt er ikke længere ledigt. Gå tilbage i bookingflowet og vælg et andet tidspunkt.",
      bookingId: "Bekræftelsesnr.",
      date: "Dato",
      time: "Tid",
      guests: "Gæster",
      duration: "Varighed",
      bookAnother: "Book et nyt bord",
      returnHome: "Til forsiden"
    }
  },
  formatters: {
    guests: (count) => `${count} ${count === 1 ? "gæst" : "gæster"}`,
    duration: (minutes) => {
      const hours = minutes / 60;

      if (Number.isInteger(hours)) {
        return `${hours} ${hours === 1 ? "time" : "timer"}`;
      }

      return `${minutes} min`;
    }
  }
};
