import { ADDRESS } from '@/consts';
import {
  AccountProvider as GearAccountProvider,
  AlertProvider as GearAlertProvider,
  ApiProvider as GearApiProvider,
  type ProviderProps,
} from '@gear-js/react-hooks';
import { Alert, alertStyles } from '@gear-js/vara-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { name as appName } from '../../package.json';

function ApiProvider({ children }: ProviderProps) {
  return <GearApiProvider initialArgs={{ endpoint: ADDRESS.NODE }}>{children}</GearApiProvider>;
}

function AlertProvider({ children }: ProviderProps) {
  return (
    <GearAlertProvider template={Alert} containerClassName={alertStyles.root}>
      {children}
    </GearAlertProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0,
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function QueryProvider({ children }: ProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function AccountProvider({ children }: ProviderProps) {
  return <GearAccountProvider appName={appName}>{children}</GearAccountProvider>;
}

const providers = [BrowserRouter, AlertProvider, ApiProvider, AccountProvider, QueryProvider];

export function withProviders(Component: ComponentType) {
  // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
  return () => providers.reduceRight((children, Provider) => <Provider>{children}</Provider>, <Component />);
}
