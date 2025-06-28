import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  url: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    schema,
    provider: "pg",
  }),
  plugins: [nextCookies()],
});
