import { useContract } from '@/hocs/ContractProvider';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { useNavigate } from 'react-router-dom';
import styles from './Battles.module.scss';

export function Battles() {
  const { api } = useApi();
  const navigate = useNavigate();
  const { account, isAccountReady } = useAccount();
  const contract = useContract();

  return (
    <div className={styles.container}>
      <button type="button" className={styles.btnHostBattle} onClick={() => navigate('/create-battle')}>
        Host a Battle
      </button>
      Battles, account: {account?.decodedAddress} {JSON.stringify(contract.services)}
    </div>
  );
}
