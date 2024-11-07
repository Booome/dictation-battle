import { useAccount, useBalance } from '@gear-js/react-hooks';
import { WalletModal } from '@gear-js/wallet-connect';
import { Box, Button } from '@mui/material';
import { useState } from 'react';

type WalletProps = {
  fontSize: string;
  direction?: 'row' | 'column';
};

export function Wallet({ fontSize, direction = 'row' }: WalletProps) {
  const { account } = useAccount();
  const { balance } = useBalance(account?.address);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const ConnectWalletButton = () => {
    return (
      <Button
        sx={{
          border: '1px solid',
          borderColor: 'primary.main',
          color: 'primary.main',
          fontSize,
        }}
        onClick={openModal}>
        CONNECT WALLET
      </Button>
    );
  };

  const ConnectedWalletButton = () => {
    return (
      <Button
        sx={{
          border: '1px solid',
          borderColor: 'primary.main',
          color: 'primary.main',
          fontSize,
          textTransform: 'none',
        }}
        onClick={openModal}>
        {account?.meta.name}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: 'fit-content',
        height: 'fit-content',
        alignItems: 'center',
        flexDirection: direction === 'row' ? 'row-reverse' : 'column-reverse',
      }}>
      {account && balance && (
        <Box
          sx={{
            fontSize,
            color: 'primary.main',
            paddingRight: '0.25rem',
            paddingTop: '0.25rem',
            paddingLeft: direction === 'row' ? '0.25rem' : '0',
            paddingBottom: direction === 'row' ? '7px' : '0',
          }}>
          {(Number(balance.toString()) / 1000000000000).toFixed(3)} TVARA
        </Box>
      )}
      {account && <ConnectedWalletButton />}
      {!account && <ConnectWalletButton />}

      {isModalOpen && <WalletModal close={closeModal} />}
    </Box>
  );
}
