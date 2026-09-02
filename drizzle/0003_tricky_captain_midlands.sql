CREATE TABLE IF NOT EXISTS `user_preferences` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`product_access` text NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
