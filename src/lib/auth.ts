import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../db/drizzle";
import { nextCookies } from "better-auth/next-js"; // your drizzle instance
import { schema } from "../../db/schema";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    // ors "mysql", "sqlite"
  }),
  plugins: [nextCookies()],
});
