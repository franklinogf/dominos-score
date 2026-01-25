ALTER TABLE `games` ADD `ended_at` text;--> statement-breakpoint
ALTER TABLE `rounds` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP);