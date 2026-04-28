import { Body, Controller, Get, Param, Post } from "@nestjs/common";

import { AvailabilityService } from "../availability/availability.service";
import { BookingsService } from "../bookings/bookings.service";
import { RestaurantsService } from "../restaurants/restaurants.service";
import { AvailabilityRequestDto } from "./dtos/availability-request.dto";
import { CreateBookingDto } from "./dtos/create-booking.dto";

@Controller("public/restaurants")
export class PublicBookingController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly availabilityService: AvailabilityService,
    private readonly bookingsService: BookingsService
  ) {}

  @Get(":slug")
  getRestaurant(@Param("slug") slug: string) {
    return this.restaurantsService.getPublicRestaurantBySlug(slug);
  }

  @Post(":slug/availability")
  getAvailability(@Param("slug") slug: string, @Body() input: AvailabilityRequestDto) {
    return this.availabilityService.getAvailability(slug, input);
  }

  @Post(":slug/bookings")
  createBooking(@Param("slug") slug: string, @Body() input: CreateBookingDto) {
    return this.bookingsService.createBooking(slug, input);
  }
}
