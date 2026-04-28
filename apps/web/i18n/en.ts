import { Messages } from "./types";

export const en: Messages = {
  common: {
    help: "Help",
    languageLabel: "Language",
    languageDa: "DA",
    languageEn: "EN",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerContact: "Contact Us",
    footerCopyright: "© 2024 Table Bookr. All rights reserved."
  },
  booking: {
    title: "Book Your Table",
    steps: {
      reservation: "Reservation",
      contact: "Contact"
    },
    guestsLabel: "Number of Guests",
    guestSelectorLabel: "Select guest count from 10 to 16",
    selectDate: "Select Date",
    specificDate: "Specific Date",
    availableTimes: "Available Times",
    noTimesAvailable: "No times available for this date.",
    updatingTimes: "Updating times...",
    continueToContact: "Continue to Contact",
    back: "<- Back",
    contactTitle: "Contact Details",
    contactSubtitle: "Please provide your details to confirm your table.",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email Address",
    emailPlaceholder: "email@example.com",
    phone: "Phone Number",
    phonePlaceholder: "+45 12 34 56 78",
    confirmBooking: "Confirm booking",
    sendBookingRequest: "Send booking request",
    submitting: "Submitting...",
    bookingTermsPrefix: "By clicking confirm, you agree to our",
    bookingTermsLink: "Booking Terms",
    loadAvailabilityFallback: "Unable to load booking times right now.",
    submitBookingFallback: "Unable to complete your booking right now.",
    validation: {
      nameRequired: "Full name is required.",
      emailRequired: "Email is required.",
      emailInvalid: "Enter a valid email address.",
      phoneRequired: "Phone number is required."
    },
    confirmation: {
      confirmedTitle: "Booking Confirmed",
      pendingTitle: "Booking Request Sent",
      blockedTitle: "Time Unavailable",
      confirmedMessage:
        "Your reservation has been successfully secured. We look forward to welcoming you.",
      pendingMessage:
        "Your booking request has been sent to the restaurant and is awaiting confirmation.",
      blockedMessage:
        "This time is no longer available. Please return to the booking flow and choose a different slot.",
      bookingId: "Confirmation #",
      date: "Date",
      time: "Time",
      guests: "Guests",
      duration: "Duration",
      bookAnother: "Book Another Table",
      returnHome: "Return to Home"
    }
  },
  formatters: {
    guests: (count) => `${count} Guest${count === 1 ? "" : "s"}`,
    duration: (minutes) => {
      const hours = minutes / 60;

      if (Number.isInteger(hours)) {
        return `${hours} Hour${hours === 1 ? "" : "s"}`;
      }

      return `${minutes} min`;
    }
  }
};
