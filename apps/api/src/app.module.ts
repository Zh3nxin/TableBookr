import { Module } from "@nestjs/common";

import { AdminModule } from "./modules/admin/admin.module";
import { AvailabilityModule } from "./modules/availability/availability.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { PublicModule } from "./modules/public/public.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";

@Module({
  imports: [
    PrismaModule,
    RestaurantsModule,
    AvailabilityModule,
    BookingsModule,
    PublicModule,
    AdminModule
  ]
})
export class AppModule {}
