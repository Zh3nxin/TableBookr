import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    adminAccessToken: string;
    user: DefaultSession["user"] & {
      adminUserId: string;
      restaurantId: string;
      restaurantName: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    adminAccessToken?: string;
    adminUserId?: string;
    restaurantId?: string;
    restaurantName?: string;
  }
}

export {};
