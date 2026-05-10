import { Module } from "@nestjs/common";

import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthGuard } from "./admin-auth.guard";
import { AdminAuthService } from "./admin-auth.service";
import { AdminBookingsService } from "./admin-bookings.service";
import { AdminBookingsController } from "./admin-bookings.controller";

@Module({
  controllers: [AdminAuthController, AdminBookingsController],
  providers: [AdminAuthService, AdminAuthGuard, AdminBookingsService]
})
export class AdminModule {}
