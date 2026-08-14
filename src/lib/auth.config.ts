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
      const { pathname } = request.nextUrl;
      const isProtected =
        pathname.startsWith("/members") || pathname.startsWith("/admin");
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
