import '@gear-js/vara-ui/dist/style.css';
import { web3Enable } from '@polkadot/extension-dapp';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

web3Enable('Dictation Battle');

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
