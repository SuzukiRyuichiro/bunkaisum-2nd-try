CREATE TABLE `involvements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`expenseId` integer,
	`amount` integer NOT NULL,
	`type` text NOT NULL,
	`shareRatio` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`expenseId`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
ALTER TABLE
	`expenses`
ADD
	`splitType` text DEFAULT 'equal';
