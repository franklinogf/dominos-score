import { useScoreModal } from '@/stores/use-score-modal';

beforeEach(() => {
  useScoreModal.setState({ isOpen: false, playerId: null });
});

describe('useScoreModal', () => {
  it('open() sets isOpen to true and stores the playerId', () => {
    useScoreModal.getState().open('player-1');
    const state = useScoreModal.getState();
    expect(state.isOpen).toBe(true);
    expect(state.playerId).toBe('player-1');
  });

  it('close() sets isOpen to false and clears playerId', () => {
    useScoreModal.getState().open('player-1');
    useScoreModal.getState().close();
    const state = useScoreModal.getState();
    expect(state.isOpen).toBe(false);
    expect(state.playerId).toBeNull();
  });

  it('calling open() twice keeps the latest playerId', () => {
    useScoreModal.getState().open('player-1');
    useScoreModal.getState().open('player-2');
    expect(useScoreModal.getState().playerId).toBe('player-2');
  });
});
