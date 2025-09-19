import { insertRound, NewRound } from '@/db/querys/round';

export async function addNewRound(newRound: NewRound) {
  try {
    const result = await insertRound(newRound);
    const roundId = result?.[0].insertedId;
    return roundId;
  } catch (error) {
    console.error('Error adding new round:', error);
  }
}
