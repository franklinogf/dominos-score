import { GameType } from '@/lib/enums';
import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const gamesTable = sqliteTable('games', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  gameSize: integer('game_size', { mode: 'number' }).notNull(),
  winningLimit: integer('winning_limit', { mode: 'number' }).notNull(),
  type: text({ enum: [GameType.NORMAL, GameType.TOURNAMENT] }).notNull(),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const roundsTable = sqliteTable('rounds', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  gameId: integer('game_id', { mode: 'number' }).notNull(),
  roundWinnerId: integer('round_winner_id', { mode: 'number' }),
});

export const playersTable = sqliteTable('players', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  roundId: integer('round_id', { mode: 'number' }).notNull(),
  name: text().notNull(),
  scores: text({ mode: 'json' }).notNull(),
  wins: integer({ mode: 'number' }).default(0).notNull(),
  losses: integer({ mode: 'number' }).default(0).notNull(),
});

export const settingsTable = sqliteTable('settings', {
  key: text().notNull().unique().primaryKey(),
  value: text().notNull(),
});

export const gamesRelations = relations(gamesTable, ({ many }) => ({
  rounds: many(roundsTable),
}));

export const roundsRelations = relations(roundsTable, ({ one, many }) => ({
  game: one(gamesTable, {
    fields: [roundsTable.gameId],
    references: [gamesTable.id],
  }),
  players: many(playersTable),

  winner: one(playersTable, {
    fields: [roundsTable.roundWinnerId],
    references: [playersTable.id],
  }),
}));

export const playersRelations = relations(playersTable, ({ one }) => ({
  round: one(roundsTable, {
    fields: [playersTable.roundId],
    references: [roundsTable.id],
  }),
}));
