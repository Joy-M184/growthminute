ALTER TABLE `plans` ADD `admin_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_plans_admin_key` ON `plans` (`admin_key`);