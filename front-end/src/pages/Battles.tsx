import { useContract } from '@/hocs/ContractProvider';
import { useAccount, useApi } from '@gear-js/react-hooks';
import styles from './Battles.module.scss';
export function Battles() {
  const { api } = useApi();
  const { account, isAccountReady } = useAccount();
  const contract = useContract();

  return (
    <div>
      <button type="button" className={styles.btnHostBattle}>
        Host a Battle
      </button>
      Battles, account: {account?.decodedAddress} {JSON.stringify(contract.services)}
    </div>
  );
}
