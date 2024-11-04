import '@gear-js/vara-ui/dist/style.css';
import { web3Enable } from '@polkadot/extension-dapp';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

web3Enable('Dictation Battle');

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
