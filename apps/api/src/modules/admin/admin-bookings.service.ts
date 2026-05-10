import {
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Booking, BookingStatus, Prisma } from "@prisma/client";
import { DateTime } from "luxon";

import {
  dbDateFromIsoDate,
  dbDateToIsoDate,
  dbTimeFromMinutes,
  dbTimeToMinutes,
  minutesToTimeString
} from "../availability/availability.utils";
import { PrismaService } from "../prisma/prisma.service";
import {
  AdminBookingAction,
  AdminBookingListStatusFilter,
  AdminBookingSummary,
  AdminRequestContext
} from "./admin.types";

@Injectable()
export class AdminBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async listBookings(
    admin: AdminRequestContext,
    filters: {
      status: AdminBookingListStatusFilter;
      date?: string;
      q?: string;
    }
  ): Promise<{ bookings: AdminBookingSummary[] }> {
    const conditions: Prisma.BookingWhereInput[] = [{ restaurantId: admin.restaurantId }];
    const statusFilter = this.getStatusFilter(filters.status);
    const trimmedQuery = filters.q?.trim();

    if (statusFilter) {
      conditions.push({ status: statusFilter });
    }

    if (filters.date) {
      conditions.push({
        bookingDate: dbDateFromIsoDate(filters.date)
      });
    } else {
      const now = DateTime.now().setZone(admin.restaurantTimezone);
      const today = now.toISODate();

      if (today) {
        conditions.push({
          OR: [
            {
              bookingDate: {
                gt: dbDateFromIsoDate(today)
              }
            },
            {
              AND: [
                { bookingDate: dbDateFromIsoDate(today) },
                {
                  bookingStartTime: {
                    gte: dbTimeFromMinutes(now.hour * 60 + now.minute)
                  }
                }
              ]
            }
          ]
        });
      }
    }

    if (trimmedQuery) {
      conditions.push({
        OR: [
          {
            customerName: {
              contains: trimmedQuery,
              mode: "insensitive"
            }
          },
          {
            customerEmail: {
              contains: trimmedQuery,
              mode: "insensitive"
            }
          },
          {
            customerPhone: {
              contains: trimmedQuery
            }
          }
        ]
      });
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        AND: conditions
      },
      orderBy: [{ bookingDate: "asc" }, { bookingStartTime: "asc" }]
    });

    return {
      bookings: bookings.map((booking) => this.mapBooking(booking))
    };
  }

  async getBooking(
    admin: AdminRequestContext,
    bookingId: string
  ): Promise<{ booking: AdminBookingSummary }> {
    const booking = await this.getBookingForRestaurant(admin.restaurantId, bookingId);

    return {
      booking: this.mapBooking(booking)
    };
  }

  async updateBookingStatus(
    admin: AdminRequestContext,
    bookingId: string,
    action: AdminBookingAction
  ): Promise<{ booking: AdminBookingSummary }> {
    const booking = await this.getBookingForRestaurant(admin.restaurantId, bookingId);
    const updatedBooking = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: this.resolveNextStatus(booking.status, action)
      }
    });

    return {
      booking: this.mapBooking(updatedBooking)
    };
  }

  private async getBookingForRestaurant(
    restaurantId: string,
    bookingId: string
  ): Promise<Booking> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        restaurantId
      }
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    return booking;
  }

  private getStatusFilter(status: AdminBookingListStatusFilter) {
    if (status === "all") {
      return undefined;
    }

    if (status === "active") {
      // Active mirrors the public capacity logic: only pending and confirmed bookings
      // should still count as occupying space.
      return {
        in: [BookingStatus.CONFIRMED, BookingStatus.PENDING]
      } satisfies Prisma.EnumBookingStatusFilter;
    }

    return this.parseBookingStatus(status);
  }

  private resolveNextStatus(currentStatus: BookingStatus, action: AdminBookingAction) {
    // Keep transitions explicit here so admin actions cannot silently drift from the product rules.
    if (action === "accept") {
      if (currentStatus !== BookingStatus.PENDING) {
        throw new ConflictException("Only pending bookings can be accepted");
      }

      return BookingStatus.CONFIRMED;
    }

    if (action === "reject") {
      if (currentStatus !== BookingStatus.PENDING) {
        throw new ConflictException("Only pending bookings can be rejected");
      }

      return BookingStatus.REJECTED;
    }

    if (currentStatus !== BookingStatus.PENDING && currentStatus !== BookingStatus.CONFIRMED) {
      throw new ConflictException("Only pending or confirmed bookings can be canceled");
    }

    return BookingStatus.CANCELED;
  }

  private mapBooking(booking: Booking): AdminBookingSummary {
    return {
      id: booking.id,
      status: this.mapBookingStatus(booking.status),
      source: "website",
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      guestCount: booking.guestCount,
      bookingDate: dbDateToIsoDate(booking.bookingDate),
      bookingStartTime: minutesToTimeString(dbTimeToMinutes(booking.bookingStartTime)),
      bookingEndTime: minutesToTimeString(dbTimeToMinutes(booking.bookingEndTime)),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    };
  }

  private mapBookingStatus(status: BookingStatus): AdminBookingSummary["status"] {
    if (status === BookingStatus.CONFIRMED) {
      return "confirmed";
    }

    if (status === BookingStatus.PENDING) {
      return "pending";
    }

    if (status === BookingStatus.REJECTED) {
      return "rejected";
    }

    return "canceled";
  }

  private parseBookingStatus(status: Exclude<AdminBookingListStatusFilter, "all" | "active">) {
    if (status === "confirmed") {
      return BookingStatus.CONFIRMED;
    }

    if (status === "pending") {
      return BookingStatus.PENDING;
    }

    if (status === "rejected") {
      return BookingStatus.REJECTED;
    }

    return BookingStatus.CANCELED;
  }
}
