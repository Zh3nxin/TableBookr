import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { PrismaService } from "../prisma/prisma.service";
import { verifyAdminAccessToken } from "./admin-auth.utils";
import { AdminRequestContext } from "./admin.types";

type RequestWithAdmin = {
  headers: {
    authorization?: string;
  };
  admin?: AdminRequestContext;
};

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing admin authorization token");
    }

    const token = authorization.slice("Bearer ".length).trim();

    try {
      const payload = verifyAdminAccessToken(token);
      const adminUser = await this.prisma.adminUser.findFirst({
        where: {
          id: payload.adminUserId,
          restaurantId: payload.restaurantId,
          isActive: true
        },
        include: {
          restaurant: true
        }
      });

      if (!adminUser) {
        throw new UnauthorizedException("Admin account is not available");
      }

      // Authorization is intentionally just restaurant scoping.
      // There are no roles once the admin user is active and belongs to this restaurant.
      request.admin = {
        adminUserId: adminUser.id,
        restaurantId: adminUser.restaurantId,
        restaurantTimezone: adminUser.restaurant.timezone
      };

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError
      ) {
        throw new UnauthorizedException("Admin session is invalid");
      }

      throw error;
    }
  }
}
