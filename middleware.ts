import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware uses only the DB-free config to guard /admin routes.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
