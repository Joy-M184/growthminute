CREATE TABLE `cash_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`mode` text NOT NULL,
	`type` text NOT NULL,
	`amount_pence` integer NOT NULL,
	`category` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`transaction_date` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cash_transactions_owner_mode_date` ON `cash_transactions` (`owner_id`,`mode`,`transaction_date`);