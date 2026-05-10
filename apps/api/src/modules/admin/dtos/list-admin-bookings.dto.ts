import { IsIn, IsOptional, Matches } from "class-validator";

import { AdminBookingListStatusFilter } from "../admin.types";

export class ListAdminBookingsDto {
  @IsOptional()
  @IsIn(["all", "active", "pending", "confirmed", "rejected", "canceled"])
  status?: AdminBookingListStatusFilter;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @IsOptional()
  q?: string;
}
