import { Player } from '@/lib/types';
import { create } from 'zustand';

type PlayerId = Player['id'];

type ScoreModalState = {
  isOpen: boolean;
  playerId: PlayerId | null;
  open: (playerId: PlayerId) => void;
  close: () => void;
};

export const useScoreModal = create<ScoreModalState>((set) => ({
  isOpen: false,
  playerId: null,
  open: (playerId: PlayerId) => set(() => ({ isOpen: true, playerId })),
  close: () => set(() => ({ isOpen: false, playerId: null })),
}));
