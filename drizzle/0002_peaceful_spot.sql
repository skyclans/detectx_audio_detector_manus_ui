CREATE TABLE `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminEmail` varchar(320) NOT NULL,
	`action` varchar(64) NOT NULL,
	`targetType` varchar(64) NOT NULL,
	`targetId` int,
	`targetEmail` varchar(320),
	`previousValue` json,
	`newValue` json,
	`details` text,
	`ipAddress` varchar(64),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`isSuperAdmin` boolean NOT NULL DEFAULT false,
	`addedBy` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','pro','enterprise','master') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `usageCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `monthlyLimit` int DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `usageResetDate` timestamp;