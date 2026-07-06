ALTER TYPE "public"."appointment_status" ADD VALUE 'atendido';--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE 'no_asistio';--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE 'cancelacion_pendiente';--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "pending_reschedule" jsonb;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "requested_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "request_reason" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "reviewed_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "review_note" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;