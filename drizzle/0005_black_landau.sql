ALTER TABLE `openAuthAccounts` RENAME TO `oAuthAccounts`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oAuthAccounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text,
	`providerUserId` text,
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` integer,
	`userId` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oAuthAccounts`("id", "provider", "providerUserId", "accessToken", "refreshToken", "expiresAt", "userId", "createdAt", "updatedAt") SELECT "id", "provider", "providerUserId", "accessToken", "refreshToken", "expiresAt", "userId", "createdAt", "updatedAt" FROM `oAuthAccounts`;--> statement-breakpoint
DROP TABLE `oAuthAccounts`;--> statement-breakpoint
ALTER TABLE `__new_oAuthAccounts` RENAME TO `oAuthAccounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;