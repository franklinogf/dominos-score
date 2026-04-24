jest.mock('@/db/querys/settings', () => ({
  updateSetting: jest.fn().mockResolvedValue(undefined),
}));

import { saveSettings } from '@/db/actions/settings';
import { updateSetting } from '@/db/querys/settings';

beforeEach(() => jest.clearAllMocks());
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => jest.restoreAllMocks());

describe('saveSettings', () => {
  it('calls updateSetting for each key-value pair', async () => {
    await saveSettings({ theme: 'dark', trioMode: 'true' });
    expect(updateSetting).toHaveBeenCalledWith('theme', 'dark');
    expect(updateSetting).toHaveBeenCalledWith('trioMode', 'true');
    expect(updateSetting).toHaveBeenCalledTimes(2);
  });

  it('does nothing when given an empty object', async () => {
    await saveSettings({});
    expect(updateSetting).not.toHaveBeenCalled();
  });

  it('does not throw when updateSetting rejects', async () => {
    (updateSetting as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    await expect(saveSettings({ key: 'val' })).resolves.not.toThrow();
  });
});
