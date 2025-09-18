import { db } from '@/db/database';
import { roundsTable } from '@/db/schema';

type NewRound = typeof roundsTable.$inferInsert;

export async function insertRound(round: NewRound) {
  try {
    const result = await db
      .insert(roundsTable)
      .values(round)
      .returning({ insertedId: roundsTable.id });
    console.log('Inserted new round with ID:', result);
    return result;
  } catch (error) {
    console.error('Database error inserting round:', error);
  }
}
