DO $$ BEGIN
 CREATE TYPE "one_time_token_type" AS ENUM('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "twilio_status" ADD VALUE 'sent';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lookup_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"address" text DEFAULT '',
	"tax_status" varchar DEFAULT '',
	"rental_status" varchar DEFAULT '',
	"zip_code" varchar DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lookup_template" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" varchar,
	"content" text,
	"type" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spatial_ref_sys" (
	"srid" integer NOT NULL,
	"auth_name" varchar(256),
	"auth_srid" integer,
	"srtext" varchar(2048),
	"proj4text" varchar(2048)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weekly_reports" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"conversation_starters_sent" integer DEFAULT 0,
	"broadcast_replies" integer DEFAULT 0,
	"text_ins" integer DEFAULT 0,
	"reporter_conversations" integer DEFAULT 0,
	"unsubscribes" integer DEFAULT 0,
	"user_satisfaction" integer DEFAULT 0,
	"problem_addressed" integer DEFAULT 0,
	"crisis_averted" integer DEFAULT 0,
	"accountability_gap" integer DEFAULT 0,
	"source" integer DEFAULT 0,
	"unsatisfied" integer DEFAULT 0,
	"future_keyword" integer DEFAULT 0,
	"status_registered" integer DEFAULT 0,
	"status_unregistered" integer DEFAULT 0,
	"status_tax_debt" integer DEFAULT 0,
	"status_no_tax_debt" integer DEFAULT 0,
	"status_compliant" integer DEFAULT 0,
	"status_foreclosed" integer DEFAULT 0,
	"replies_total" integer DEFAULT 0,
	"replies_proactive" integer DEFAULT 0,
	"replies_receptive" integer DEFAULT 0,
	"replies_connected" integer DEFAULT 0,
	"replies_passive" integer DEFAULT 0,
	"replies_inactive" integer DEFAULT 0,
	"unsubscribes_total" integer DEFAULT 0,
	"unsubscribes_proactive" integer DEFAULT 0,
	"unsubscribes_receptive" integer DEFAULT 0,
	"unsubscribes_connected" integer DEFAULT 0,
	"unsubscribes_passive" integer DEFAULT 0,
	"unsubscribes_inactive" integer DEFAULT 0,
	"failed_deliveries" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "unsubscribe_messages" RENAME TO "unsubscribed_messages";--> statement-breakpoint
ALTER TABLE "conversations_authors" DROP CONSTRAINT "conversations_authors_conversation_id_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations_labels" DROP CONSTRAINT "conversations_labels_conversation_id_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "outgoing_messages" DROP CONSTRAINT "outgoing_messages_recipient_phone_number_authors_phone_number_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "conversation_label";--> statement-breakpoint
DROP INDEX IF EXISTS "twilio_messages_delivered_at_idx";--> statement-breakpoint
ALTER TABLE "broadcasts_segments" ALTER COLUMN "ratio" SET DATA TYPE smallint;--> statement-breakpoint
ALTER TABLE "labels" ALTER COLUMN "share_with_organization" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "unsubscribed_messages" ALTER COLUMN "broadcast_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "unsubscribed_messages" ALTER COLUMN "reply_to" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "audience_segments" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "authors" ADD COLUMN "zipcode" varchar;--> statement-breakpoint
ALTER TABLE "authors" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "twilio_messages" ADD COLUMN "sender_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broadcast_sent_message_status_recipient_phone_number_idx" ON "broadcast_sent_message_status" ("recipient_phone_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "broadcast_sent_message_status_created_at_idx" ON "broadcast_sent_message_status" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "twilio_messages_duplicate_delivered_at_idx" ON "twilio_messages" ("delivered_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "twilio_messages_duplicate_is_broadcast_reply_idx" ON "twilio_messages" ("is_broadcast_reply");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "twilio_messages_duplicate_from_field_idx" ON "twilio_messages" ("from_field");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "unsubscribed_messages_twilio_message_id_idx" ON "unsubscribed_messages" ("twilio_message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "unsubscribed_messages_broadcast_id_idx" ON "unsubscribed_messages" ("broadcast_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast_sent_message_status" ADD CONSTRAINT "broadcast_sent_message_status_audience_segment_id_audience_segments_id_fk" FOREIGN KEY ("audience_segment_id") REFERENCES "audience_segments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_labels" ADD CONSTRAINT "conversations_labels_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outgoing_messages" ADD CONSTRAINT "outgoing_messages_recipient_phone_number_authors_phone_number_fk" FOREIGN KEY ("recipient_phone_number") REFERENCES "authors"("phone_number") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twilio_messages" ADD CONSTRAINT "twilio_messages_reply_to_broadcast_broadcasts_id_fk" FOREIGN KEY ("reply_to_broadcast") REFERENCES "broadcasts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twilio_messages" ADD CONSTRAINT "twilio_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "outgoing_messages" ADD CONSTRAINT "unique_phone_number_broadcast_id_is_second" UNIQUE("recipient_phone_number","broadcast_id","is_second");
