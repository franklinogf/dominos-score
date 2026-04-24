import { useAddPlayerDialog } from '@/stores/use-add-player-dialog';

beforeEach(() => {
  useAddPlayerDialog.setState({ isOpen: false });
});

describe('useAddPlayerDialog', () => {
  it('open() sets isOpen to true', () => {
    useAddPlayerDialog.getState().open();
    expect(useAddPlayerDialog.getState().isOpen).toBe(true);
  });

  it('close() sets isOpen to false', () => {
    useAddPlayerDialog.getState().open();
    useAddPlayerDialog.getState().close();
    expect(useAddPlayerDialog.getState().isOpen).toBe(false);
  });
});
