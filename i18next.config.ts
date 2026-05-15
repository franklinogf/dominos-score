import { defaultNS } from './lib/i18n';

export default {
  locales: ['en', 'es'],
  extract: {
    input: 'app/**/*.{js,jsx,ts,tsx}',
    output: 'locales/{{language}}/{{namespace}}.json',
    defaultNS,
  },
  lint: {
    ignore: ['components/ui/*'],
  },
};
