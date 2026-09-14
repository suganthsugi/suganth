import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no database / bcrypt imports) so it can be used by
 * `middleware.ts`. The Credentials provider is added in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Gate every /admin route except the login page itself.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isLoginPage = path === "/admin/login";
      const isAdminArea = path.startsWith("/admin");

      if (isAdminArea && !isLoginPage) {
        return isLoggedIn; // redirects to signIn page when false
      }
      if (isLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return true;
    },
  },
  providers: [], // extended in auth.ts
} satisfies NextAuthConfig;
