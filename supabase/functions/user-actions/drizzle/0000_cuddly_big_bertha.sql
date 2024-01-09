CREATE TABLE IF NOT EXISTS "authors" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" text,
	"phone_number" text PRIMARY KEY NOT NULL,
	CONSTRAINT "authors_phone_number_key" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text,
	"task_completed_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"is_task" boolean DEFAULT false NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid,
	"attachment" text,
	CONSTRAINT "comments_uuid_key" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments_mentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversation_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"change_type" text,
	"team_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"messages_count" integer DEFAULT 0 NOT NULL,
	"drafts_count" integer DEFAULT 0 NOT NULL,
	"send_later_messages_count" integer DEFAULT 0 NOT NULL,
	"attachments_count" integer DEFAULT 0 NOT NULL,
	"tasks_count" integer DEFAULT 0 NOT NULL,
	"completed_tasks_count" integer DEFAULT 0 NOT NULL,
	"subject" text,
	"latest_message_subject" text,
	"assignee_names" text,
	"assignee_emails" text,
	"shared_label_names" text,
	"web_url" text NOT NULL,
	"app_url" text NOT NULL,
	"updated_at" timestamp with time zone,
	"closed" boolean,
	"organization_id" uuid,
	"team_id" uuid,
	CONSTRAINT "conversation_uuid_key" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations_assignees" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unassigned" boolean DEFAULT false NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"trashed" boolean DEFAULT false NOT NULL,
	"junked" boolean DEFAULT false NOT NULL,
	"assigned" boolean DEFAULT false NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"snoozed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations_assignees_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unassigned" boolean DEFAULT false NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"trashed" boolean DEFAULT false NOT NULL,
	"junked" boolean DEFAULT false NOT NULL,
	"assigned" boolean DEFAULT false NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"snoozed" boolean DEFAULT false NOT NULL,
	"conversation_history_id" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations_authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"author_phone_number" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"unassigned" boolean DEFAULT false NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"trashed" boolean DEFAULT false NOT NULL,
	"junked" boolean DEFAULT false NOT NULL,
	"assigned" boolean DEFAULT false NOT NULL,
	"flagged" boolean DEFAULT false NOT NULL,
	"snoozed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "conversations_users_unique_key" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_body" text NOT NULL,
	"rule_type" text,
	"rule_id" uuid,
	"rule_description" text,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labels" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"name_with_parent_names" text DEFAULT '' NOT NULL,
	"color" text,
	"parent" uuid,
	"share_with_organization" boolean DEFAULT false NOT NULL,
	"visibility" text,
	CONSTRAINT "labels_uuid_key" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rules" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "rules_uuid_key" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks_assignees" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text,
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "twilio_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preview" text NOT NULL,
	"type" text,
	"delivered_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	"references" text[] NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"external_id" text,
	"attachments" text,
	"fromField" text NOT NULL,
	"toField" text NOT NULL,
	"accountAuthor" text NOT NULL,
	"accountRecipient" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text,
	"email" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"email" text,
	"name" text,
	"avatar_url" text,
	"id" uuid PRIMARY KEY NOT NULL,
	CONSTRAINT "users_uuid_key" UNIQUE("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "conversation_label" ON "conversations_labels" ("conversation_id","label_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_history_id" ON "user_history" ("id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments_mentions" ADD CONSTRAINT "comments_mentions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments_mentions" ADD CONSTRAINT "comments_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments_mentions" ADD CONSTRAINT "comments_mentions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_history" ADD CONSTRAINT "conversation_history_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_history" ADD CONSTRAINT "conversation_history_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_assignees" ADD CONSTRAINT "conversations_assignees_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_assignees" ADD CONSTRAINT "conversations_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_assignees_history" ADD CONSTRAINT "conversations_assignees_history_conversation_history_id_conversation_history_id_fk" FOREIGN KEY ("conversation_history_id") REFERENCES "conversation_history"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_authors" ADD CONSTRAINT "conversations_authors_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_authors" ADD CONSTRAINT "conversations_authors_author_phone_number_authors_phone_number_fk" FOREIGN KEY ("author_phone_number") REFERENCES "authors"("phone_number") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_labels" ADD CONSTRAINT "conversations_labels_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_labels" ADD CONSTRAINT "conversations_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_users" ADD CONSTRAINT "conversations_users_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations_users" ADD CONSTRAINT "conversations_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks_assignees" ADD CONSTRAINT "tasks_assignees_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks_assignees" ADD CONSTRAINT "tasks_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twilio_messages" ADD CONSTRAINT "twilio_messages_fromField_authors_phone_number_fk" FOREIGN KEY ("fromField") REFERENCES "authors"("phone_number") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twilio_messages" ADD CONSTRAINT "twilio_messages_toField_authors_phone_number_fk" FOREIGN KEY ("toField") REFERENCES "authors"("phone_number") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twilio_messages" ADD CONSTRAINT "twilio_messages_accountAuthor_authors_phone_number_fk" FOREIGN KEY ("accountAuthor") REFERENCES "authors"("phone_number") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "twilio_messages" ADD CONSTRAINT "twilio_messages_accountRecipient_authors_phone_number_fk" FOREIGN KEY ("accountRecipient") REFERENCES "authors"("phone_number") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_history" ADD CONSTRAINT "user_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
