import type { NextAuthConfig } from "next-auth";

// Edge-safe base config, shared by middleware.ts (which runs on the Edge
// runtime and can't import the Postgres driver) and the full config in
// auth.ts (which adds the DB-backed Credentials provider and runs in
// the Node.js runtime).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnMembers = request.nextUrl.pathname.startsWith("/members");
      if (isOnMembers) return isLoggedIn;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
