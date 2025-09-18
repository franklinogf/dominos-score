ALTER TABLE `games` RENAME COLUMN "gameSize" TO "game_size";--> statement-breakpoint
ALTER TABLE `games` RENAME COLUMN "winningLimit" TO "winning_limit";--> statement-breakpoint
ALTER TABLE `games` RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE `players` RENAME COLUMN "roundId" TO "round_id";--> statement-breakpoint
ALTER TABLE `rounds` RENAME COLUMN "gameId" TO "game_id";--> statement-breakpoint
ALTER TABLE `rounds` RENAME COLUMN "roundWinnerId" TO "round_winner_id";