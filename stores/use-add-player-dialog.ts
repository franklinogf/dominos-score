import { create } from 'zustand';

type AddPlayerDialogState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useAddPlayerDialog = create<AddPlayerDialogState>((set) => ({
  isOpen: false,
  open: () => set(() => ({ isOpen: true })),
  close: () => set(() => ({ isOpen: false })),
}));
