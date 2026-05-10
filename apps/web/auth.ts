import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getApiBaseUrl } from "@/lib/api/base-url";

type AdminAuthUser = {
  id: string;
  name: string;
  email: string;
  adminUserId: string;
  restaurantId: string;
  restaurantName: string;
  accessToken: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const response = await fetch(`${getApiBaseUrl()}/admin/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password }),
          cache: "no-store"
        });

        if (!response.ok) {
          return null;
        }

        // The backend stays the source of truth for staff credentials and restaurant scope.
        // Auth.js only stores the already-validated admin session data.
        const payload = (await response.json()) as {
          accessToken: string;
          adminUser: {
            id: string;
            name: string;
            email: string;
          };
          restaurant: {
            id: string;
            name: string;
          };
        };

        return {
          id: payload.adminUser.id,
          name: payload.adminUser.name,
          email: payload.adminUser.email,
          adminUserId: payload.adminUser.id,
          restaurantId: payload.restaurant.id,
          restaurantName: payload.restaurant.name,
          accessToken: payload.accessToken
        } satisfies AdminAuthUser;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Persist the backend-issued bearer token so server-rendered admin pages can keep using
        // the Nest API instead of reaching for Prisma directly.
        const adminUser = user as AdminAuthUser;
        token.adminAccessToken = adminUser.accessToken;
        token.adminUserId = adminUser.adminUserId;
        token.restaurantId = adminUser.restaurantId;
        token.restaurantName = adminUser.restaurantName;
      }

      return token;
    },
    session({ session, token }) {
      if (!session.user || !token.adminAccessToken || !token.adminUserId || !token.restaurantId) {
        return session;
      }

      session.adminAccessToken = token.adminAccessToken;
      session.user.adminUserId = token.adminUserId;
      session.user.restaurantId = token.restaurantId;
      session.user.restaurantName = token.restaurantName || session.user.name || "Restaurant";

      return session;
    }
  }
});
