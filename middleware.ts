import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Uses the edge-safe base config only — no Postgres driver in this bundle.
// The `authorized` callback in auth.config.ts decides the redirect.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/members/:path*", "/admin/:path*"],
};
