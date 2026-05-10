import { Injectable, UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcryptjs";

import { PrismaService } from "../prisma/prisma.service";
import { AdminLoginResponse } from "./admin.types";
import { signAdminAccessToken } from "./admin-auth.utils";

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string): Promise<AdminLoginResponse> {
    const normalizedEmail = email.trim().toLowerCase();
    const adminUser = await this.prisma.adminUser.findUnique({
      where: {
        email: normalizedEmail
      },
      include: {
        restaurant: true
      }
    });

    if (!adminUser?.isActive) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Auth stays simple on purpose: one admin account belongs to one restaurant,
    // and any valid admin for that restaurant gets full access there.
    return {
      accessToken: signAdminAccessToken({
        adminUserId: adminUser.id,
        restaurantId: adminUser.restaurantId
      }),
      adminUser: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email
      },
      restaurant: {
        id: adminUser.restaurant.id,
        name: adminUser.restaurant.name
      }
    };
  }
}
