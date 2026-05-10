import jwt from "jsonwebtoken";

import { AdminAccessTokenPayload } from "./admin.types";

const DEFAULT_ADMIN_TOKEN_TTL = "7d";

function getTokenSecret() {
  return process.env.ADMIN_API_TOKEN_SECRET || "dev-admin-api-token-secret";
}

export function signAdminAccessToken(payload: AdminAccessTokenPayload) {
  return jwt.sign(payload, getTokenSecret(), {
    expiresIn: DEFAULT_ADMIN_TOKEN_TTL
  });
}

export function verifyAdminAccessToken(token: string) {
  return jwt.verify(token, getTokenSecret()) as AdminAccessTokenPayload;
}
