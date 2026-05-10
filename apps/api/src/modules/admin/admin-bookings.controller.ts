import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";

import { AdminAuthGuard } from "./admin-auth.guard";
import { AdminBookingsService } from "./admin-bookings.service";
import { AdminRequestContext } from "./admin.types";
import { ListAdminBookingsDto } from "./dtos/list-admin-bookings.dto";
import { UpdateBookingStatusDto } from "./dtos/update-booking-status.dto";

type RequestWithAdmin = {
  admin: AdminRequestContext;
};

@UseGuards(AdminAuthGuard)
@Controller("admin/bookings")
export class AdminBookingsController {
  constructor(private readonly adminBookingsService: AdminBookingsService) {}

  @Get()
  listBookings(@Req() request: RequestWithAdmin, @Query() query: ListAdminBookingsDto) {
    return this.adminBookingsService.listBookings(request.admin, {
      status: query.status ?? "active",
      date: query.date,
      q: query.q
    });
  }

  @Get(":id")
  getBooking(@Req() request: RequestWithAdmin, @Param("id") bookingId: string) {
    return this.adminBookingsService.getBooking(request.admin, bookingId);
  }

  @Patch(":id/status")
  updateBookingStatus(
    @Req() request: RequestWithAdmin,
    @Param("id") bookingId: string,
    @Body() input: UpdateBookingStatusDto
  ) {
    return this.adminBookingsService.updateBookingStatus(request.admin, bookingId, input.action);
  }
}
