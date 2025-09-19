import { GameType } from '@/lib/enums';
import { relations, sql } from 'drizzle-orm';
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

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
  gameId: integer('game_id', { mode: 'number' })
    .references(() => gamesTable.id, { onDelete: 'cascade' })
    .notNull(),
  roundWinnerId: integer('round_winner_id', { mode: 'number' }),
});

export const playersTable = sqliteTable('players', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  gameId: integer('game_id', { mode: 'number' })
    .references(() => gamesTable.id, { onDelete: 'cascade' })
    .notNull(),
  name: text().notNull(),
  wins: integer({ mode: 'number' }).default(0).notNull(),
  losses: integer({ mode: 'number' }).default(0).notNull(),
});

export const playersToRoundsTable = sqliteTable(
  'players_rounds',
  {
    playerId: integer('player_id', { mode: 'number' })
      .notNull()
      .references(() => playersTable.id, { onDelete: 'cascade' }),
    roundId: integer('round_id', { mode: 'number' })
      .references(() => roundsTable.id, { onDelete: 'cascade' })
      .notNull(),
    scores: text({ mode: 'json' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.roundId] })],
);

export const settingsTable = sqliteTable('settings', {
  key: text().notNull().unique().primaryKey(),
  value: text().notNull(),
});

export const gamesRelations = relations(gamesTable, ({ many }) => ({
  players: many(playersTable),
  rounds: many(roundsTable),
}));

export const playersRelations = relations(playersTable, ({ many }) => ({
  playerToRounds: many(playersToRoundsTable),
}));

export const roundsRelations = relations(roundsTable, ({ one, many }) => ({
  game: one(gamesTable, {
    fields: [roundsTable.gameId],
    references: [gamesTable.id],
  }),
  playersToRounds: many(playersToRoundsTable),
  winner: one(playersTable, {
    fields: [roundsTable.roundWinnerId],
    references: [playersTable.id],
  }),
}));

export const playersToRoundsRelations = relations(
  playersToRoundsTable,
  ({ one }) => ({
    player: one(playersTable, {
      fields: [playersToRoundsTable.playerId],
      references: [playersTable.id],
    }),
    round: one(roundsTable, {
      fields: [playersToRoundsTable.roundId],
      references: [roundsTable.id],
    }),
  }),
);
