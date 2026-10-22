ALTER TABLE "links" ADD COLUMN "videoId" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "englishSubtitles" boolean;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "subtitle_checked_at" timestamp;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "notified_at" timestamp;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_videoId_key" UNIQUE("videoId");