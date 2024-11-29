import { useContract } from '@/hocs/ContractProvider';
import { gearSendMessage } from '@/types/utils';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { Alert, Box, Button, InputAdornment, Snackbar, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { BaseModal } from './BaseModal';

type Props = {
  open: boolean;
  onClose: () => void;
  onJoinSucceed?: () => void;
  battleId: number;
  entryFee: number;
};

export default function JoinBattleModal({ open, onClose, onJoinSucceed, battleId, entryFee }: Props) {
  const [payment, setPayment] = useState(entryFee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { api } = useApi();
  const { account } = useAccount();
  const { programId, metadata } = useContract();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setPayment(entryFee);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!api || !account || !metadata) {
      throw new Error('Wallet not connected');
    }

    const message = {
      destination: programId as `0x${string}`,
      payload: {
        JoinChallenge: {
          id: battleId,
        },
      },
      gasLimit: 750000000000,
      value: payment * 10 ** 12,
    };

    gearSendMessage(api, account, metadata, message)
      .then(() => {
        setShowSuccess(true);
        setTimeout(() => {
          onJoinSucceed?.();
        }, 3000);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPayment(value === '' ? 0 : parseFloat(value));
  };

  const isFormValid = () => {
    return payment >= entryFee;
  };

  const handleSnackbarClose = () => {
    setShowSuccess(false);
  };

  return (
    <>
      <BaseModal open={open} onClose={onClose}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          sx={{ bgcolor: 'white', width: '50%', maxWidth: '34rem', margin: 'auto', padding: 3 }}>
          <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Join Battle #{battleId}</Box>

          <Box sx={{ fontWeight: 500, textAlign: 'center', my: 2 }}>Payment (≥ {entryFee})</Box>
          <TextField
            fullWidth
            size="small"
            type="number"
            defaultValue={payment}
            onChange={handlePaymentChange}
            disabled={isSubmitting}
            error={payment < entryFee}
            helperText={payment < entryFee ? `Minimum payment is ${entryFee}` : ''}
            title="A higher payment will increase your share of the prize pool"
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">TVARA</InputAdornment>,
              },
              htmlInput: {
                step: 0.000000000001,
              },
            }}
            sx={{
              '& input': { textAlign: 'center' },
            }}
          />

          {error && (
            <Box
              sx={{
                color: 'error.main',
                textAlign: 'center',
                mt: 1,
                fontSize: '0.875rem',
              }}>
              {error}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button type="submit" variant="contained" disabled={!isFormValid() || isSubmitting} sx={{ width: '15rem' }}>
              {isSubmitting ? 'PENDING...' : 'SUBMIT'}
            </Button>
            <Button type="button" variant="outlined" onClick={onClose} disabled={isSubmitting} sx={{ width: '15rem' }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </BaseModal>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Join Battle #{battleId} Succeed!
        </Alert>
      </Snackbar>
    </>
  );
}
