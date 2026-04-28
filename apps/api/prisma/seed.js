const { PrismaClient, Weekday } = require("@prisma/client");

const prisma = new PrismaClient();

function dateValue(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function timeValue(timeString) {
  return new Date(`1970-01-01T${timeString}:00.000Z`);
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
