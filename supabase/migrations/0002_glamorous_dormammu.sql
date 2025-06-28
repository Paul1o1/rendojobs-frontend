ALTER TABLE "user" ALTER COLUMN "email_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "portfolio_url" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "github_url" text;