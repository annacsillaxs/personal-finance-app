CREATE TYPE "public"."entry_kind" AS ENUM('opening_balance', 'transaction', 'pot_transfer');--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" text NOT NULL,
	"maximum_cents" integer NOT NULL,
	"theme" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "budgets_maximum_positive" CHECK ("budgets"."maximum_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "entry_kind" NOT NULL,
	"amount_cents" integer NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"counterparty" text,
	"avatar_url" text,
	"category" text,
	"is_recurring" boolean,
	"pot_id" uuid,
	CONSTRAINT "entries_amount_nonzero" CHECK ("entries"."amount_cents" <> 0),
	CONSTRAINT "entries_shape_matches_kind" CHECK ((
        "entries"."kind" = 'transaction'
          and "entries"."counterparty" is not null
          and "entries"."category"     is not null
          and "entries"."is_recurring"  is not null
          and "entries"."pot_id"        is null
      ) or (
        "entries"."kind" = 'pot_transfer'
          and "entries"."pot_id"        is not null
          and "entries"."counterparty" is null
          and "entries"."category"     is null
          and "entries"."is_recurring"  is null
      ) or (
        "entries"."kind" = 'opening_balance'
          and "entries"."pot_id"        is null
          and "entries"."counterparty" is null
          and "entries"."category"     is null
          and "entries"."is_recurring"  is null
      ))
);
--> statement-breakpoint
CREATE TABLE "pots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"target_cents" integer NOT NULL,
	"theme" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "pots_target_positive" CHECK ("pots"."target_cents" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_pot_id_pots_id_fk" FOREIGN KEY ("pot_id") REFERENCES "public"."pots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pots" ADD CONSTRAINT "pots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budgets_user_category_live_idx" ON "budgets" USING btree ("user_id","category") WHERE "budgets"."closed_at" is null;--> statement-breakpoint
CREATE INDEX "entries_user_occurred_idx" ON "entries" USING btree ("user_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "entries_user_category_idx" ON "entries" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "entries_pot_idx" ON "entries" USING btree ("pot_id");--> statement-breakpoint
CREATE INDEX "entries_user_recurring_idx" ON "entries" USING btree ("user_id","counterparty") WHERE "entries"."is_recurring" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "pots_user_name_live_idx" ON "pots" USING btree ("user_id","name") WHERE "pots"."closed_at" is null;