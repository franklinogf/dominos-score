import { create } from "zustand";
type TournamentModalState = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useTournamentModal = create<TournamentModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
