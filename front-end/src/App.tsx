import { useAccount, useApi } from '@gear-js/react-hooks';

import styles from './App.module.scss';
import { ApiLoader } from './components/ApiLoader';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { withProviders } from './hocs';
import { Routing } from './pages';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  const isAppReady = isApiReady && isAccountReady;

  return (
    <div className={styles.appContainer}>
      <Header />
      <div className={styles.bodyContainer}>
        <div className={styles.sidebarContainer}>
          <Sidebar />
        </div>
        <div className={styles.mainContainer}>
          <main>{isAppReady ? <Routing /> : <ApiLoader />}</main>
        </div>
      </div>
    </div>
  );
}

export const App = withProviders(Component);
