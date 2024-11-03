import { useAccount, useApi } from '@gear-js/react-hooks';
import { useLocation } from 'react-router-dom';
import styles from './App.module.scss';
import { ApiLoader } from './components/ApiLoader';
import { Header } from './components/Header';
import { SIDEBAR_ITEMS, Sidebar } from './components/Sidebar';
import { withProviders } from './hocs';
import { Routing } from './pages';

function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();
  const location = useLocation();

  const isAppReady = isApiReady && isAccountReady;
  const showSidebar = SIDEBAR_ITEMS.some((item) => location.pathname === item.route);

  return (
    <div className={styles.appContainer}>
      <Header />
      <div className={styles.bodyContainer}>
        <div className={`${styles.sidebarContainer} ${!showSidebar ? styles.hidden : ''}`}>
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
