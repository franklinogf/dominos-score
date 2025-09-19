PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_players_rounds` (
	`player_id` integer NOT NULL,
	`round_id` integer NOT NULL,
	`scores` text NOT NULL,
	PRIMARY KEY(`player_id`, `round_id`),
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_players_rounds`("player_id", "round_id", "scores") SELECT "player_id", "round_id", "scores" FROM `players_rounds`;--> statement-breakpoint
DROP TABLE `players_rounds`;--> statement-breakpoint
ALTER TABLE `__new_players_rounds` RENAME TO `players_rounds`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`name` text NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_players`("id", "game_id", "name", "wins", "losses") SELECT "id", "game_id", "name", "wins", "losses" FROM `players`;--> statement-breakpoint
DROP TABLE `players`;--> statement-breakpoint
ALTER TABLE `__new_players` RENAME TO `players`;--> statement-breakpoint
CREATE TABLE `__new_rounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`round_winner_id` integer,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rounds`("id", "game_id", "round_winner_id") SELECT "id", "game_id", "round_winner_id" FROM `rounds`;--> statement-breakpoint
DROP TABLE `rounds`;--> statement-breakpoint
ALTER TABLE `__new_rounds` RENAME TO `rounds`;