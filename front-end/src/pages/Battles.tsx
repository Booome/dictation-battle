import { sails } from '@/utils';
import { useAccount, useApi } from '@gear-js/react-hooks';

export function Battles() {
  const { api } = useApi();
  const { account, isAccountReady } = useAccount();

  console.log('sails', sails);

  return <div>Battles, account: {account?.decodedAddress}</div>;
}
