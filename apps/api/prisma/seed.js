const bcrypt = require("bcryptjs");
const { BookingSource, BookingStatus, PrismaClient, Weekday } = require("@prisma/client");

const prisma = new PrismaClient();
const ADMIN_SEED_EMAIL = (process.env.ADMIN_SEED_EMAIL || "admin@test-restaurant.local")
  .trim()
  .toLowerCase();
const ADMIN_SEED_NAME = (process.env.ADMIN_SEED_NAME || "Restaurant Admin").trim();
const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD || "admin123456";

function dateValue(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function timeValue(timeString) {
  return new Date(`1970-01-01T${timeString}:00.000Z`);
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function nextWeekdayDate(targetWeekday) {
  const today = new Date();
  const currentWeekday = today.getDay();
  let daysUntil = (targetWeekday - currentWeekday + 7) % 7;

  if (daysUntil === 0) {
    daysUntil = 7;
  }

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  return nextDate;
}

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "test-restaurant" },
    update: {
      name: "Test Restaurant",
      email: "bookings@harbortable.example",
      phone: "+4512345678",
      timezone: "Europe/Copenhagen"
    },
    create: {
      name: "Test Restaurant",
      slug: "test-restaurant",
      email: "bookings@harbortable.example",
      phone: "+4512345678",
      timezone: "Europe/Copenhagen"
    }
  });

  await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {
      bookingSlotMinutes: 30,
      bookingDurationMinutes: 120,
      maxOnlinePartySize: 16,
      autoConfirmThreshold: 99,
      hardCapacityLimit: 120,
      minimumLeadTimeMinutes: 60
    },
    create: {
      restaurantId: restaurant.id,
      bookingSlotMinutes: 30,
      bookingDurationMinutes: 120,
      maxOnlinePartySize: 16,
      autoConfirmThreshold: 99,
      hardCapacityLimit: 120,
      minimumLeadTimeMinutes: 60
    }
  });

  await prisma.openingHour.deleteMany({
    where: { restaurantId: restaurant.id }
  });

  await prisma.openingHour.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        weekday: Weekday.MONDAY,
        isOpen: false,
        openTime: null,
        closeTime: null
      },
      {
        restaurantId: restaurant.id,
        weekday: Weekday.TUESDAY,
        isOpen: true,
        openTime: timeValue("17:00"),
        closeTime: timeValue("22:00")
      },
      {
        restaurantId: restaurant.id,
        weekday: Weekday.WEDNESDAY,
        isOpen: true,
        openTime: timeValue("17:00"),
        closeTime: timeValue("22:00")
      },
      {
        restaurantId: restaurant.id,
        weekday: Weekday.THURSDAY,
        isOpen: true,
        openTime: timeValue("17:00"),
        closeTime: timeValue("22:00")
      },
      {
        restaurantId: restaurant.id,
        weekday: Weekday.FRIDAY,
        isOpen: true,
        openTime: timeValue("17:00"),
        closeTime: timeValue("23:00")
      },
      {
        restaurantId: restaurant.id,
        weekday: Weekday.SATURDAY,
        isOpen: true,
        openTime: timeValue("17:00"),
        closeTime: timeValue("23:00")
      },
      {
        restaurantId: restaurant.id,
        weekday: Weekday.SUNDAY,
        isOpen: true,
        openTime: timeValue("12:00"),
        closeTime: timeValue("21:00")
      }
    ]
  });

  await prisma.closedDate.deleteMany({
    where: { restaurantId: restaurant.id }
  });

  await prisma.closedDate.create({
    data: {
      restaurantId: restaurant.id,
      date: dateValue("2026-12-24"),
      note: "Closed for Christmas Eve"
    }
  });

  const passwordHash = await bcrypt.hash(ADMIN_SEED_PASSWORD, 10);

  await prisma.adminUser.upsert({
    where: { email: ADMIN_SEED_EMAIL },
    update: {
      restaurantId: restaurant.id,
      name: ADMIN_SEED_NAME,
      passwordHash,
      isActive: true
    },
    create: {
      restaurantId: restaurant.id,
      name: ADMIN_SEED_NAME,
      email: ADMIN_SEED_EMAIL,
      passwordHash,
      isActive: true
    }
  });

  await prisma.booking.deleteMany({
    where: { restaurantId: restaurant.id }
  });

  const nextTuesday = formatDateOnly(nextWeekdayDate(2));
  const nextWednesday = formatDateOnly(nextWeekdayDate(3));
  const nextFriday = formatDateOnly(nextWeekdayDate(5));

  await prisma.booking.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        customerName: "Alice Jensen",
        customerEmail: "alice@example.com",
        customerPhone: "+4511122233",
        guestCount: 2,
        bookingDate: dateValue(nextTuesday),
        bookingStartTime: timeValue("17:30"),
        bookingEndTime: timeValue("19:30"),
        status: BookingStatus.PENDING,
        source: BookingSource.WEBSITE
      },
      {
        restaurantId: restaurant.id,
        customerName: "Marcus Holm",
        customerEmail: "marcus@example.com",
        customerPhone: "+4522233344",
        guestCount: 4,
        bookingDate: dateValue(nextTuesday),
        bookingStartTime: timeValue("19:00"),
        bookingEndTime: timeValue("21:00"),
        status: BookingStatus.CONFIRMED,
        source: BookingSource.WEBSITE
      },
      {
        restaurantId: restaurant.id,
        customerName: "Sofia Larsen",
        customerEmail: "sofia@example.com",
        customerPhone: "+4533344455",
        guestCount: 6,
        bookingDate: dateValue(nextWednesday),
        bookingStartTime: timeValue("18:00"),
        bookingEndTime: timeValue("20:00"),
        status: BookingStatus.PENDING,
        source: BookingSource.WEBSITE
      },
      {
        restaurantId: restaurant.id,
        customerName: "Jonas Madsen",
        customerEmail: "jonas@example.com",
        customerPhone: "+4544455566",
        guestCount: 3,
        bookingDate: dateValue(nextFriday),
        bookingStartTime: timeValue("20:00"),
        bookingEndTime: timeValue("22:00"),
        status: BookingStatus.CONFIRMED,
        source: BookingSource.WEBSITE
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
