import { Module } from "@nestjs/common";

import { AvailabilityModule } from "../availability/availability.module";
import { BookingsModule } from "../bookings/bookings.module";
import { RestaurantsModule } from "../restaurants/restaurants.module";
import { PublicBookingController } from "./public-booking.controller";

@Module({
  imports: [RestaurantsModule, AvailabilityModule, BookingsModule],
  controllers: [PublicBookingController]
})
export class PublicModule {}
