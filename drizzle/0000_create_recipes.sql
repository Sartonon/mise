CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`servings` integer DEFAULT 4 NOT NULL,
	`minutes` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
