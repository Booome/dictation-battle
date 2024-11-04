import { useContract } from '@/hocs/ContractProvider';
import { useAccount } from '@gear-js/react-hooks';
import { Alert, Box, Button, Paper, Snackbar, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { web3FromSource } from '@polkadot/extension-dapp';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CreateBattle() {
  const [entryFee, setEntryFee] = useState<string>('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contract = useContract();
  const { account } = useAccount();
  const isWalletConnected = !!account;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!account?.address || !account?.meta?.source) {
      throw new Error('Wallet not connected');
    }

    const entryFeeNumber = Number.parseInt(entryFee);
    const timeZone = dayjs().utcOffset() / 60;
    const startDateNumber = startDate ? Math.floor(startDate.valueOf() / 1000) : 0;
    const endDateNumber = endDate ? Math.floor(endDate.valueOf() / 1000) : 0;

    console.debug('entryFeeNumber:', entryFeeNumber);
    console.debug('timeZone:', timeZone);
    console.debug('startDateNumber:', startDateNumber);
    console.debug('endDateNumber:', endDateNumber);

    try {
      const transaction = contract.services.DictationBattle.functions.CreateBattle(
        entryFeeNumber,
        timeZone,
        startDateNumber,
        endDateNumber,
      );
      const injector = await web3FromSource(account.meta.source);
      transaction.withAccount(account.address, { signer: injector.signer });
      //   await transaction.calculateGas(true, 10);
      const { msgId, blockHash, txHash, response, isFinalized } = await transaction.signAndSend();

      console.debug('msgId:', msgId);
      console.debug('blockHash:', blockHash);
      console.debug('txHash:', txHash);
      console.debug('response:', response);
      console.debug('isFinalized:', await isFinalized);

      navigate('/battles');
    } catch (error) {
      console.error('error:', error);
      setError(error as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ p: 3, width: '400px' }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '& .MuiTextField-root': { fontSize: '0.9rem' },
              '& .MuiInputLabel-root': { fontSize: '0.9rem' },
              '& .MuiInputBase-input': { fontSize: '0.9rem' },
              '& .MuiButton-root': { fontSize: '0.9rem' },
            }}>
            <TextField
              size="small"
              label="Entry Fee"
              type="number"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
            />

            <DatePicker
              slotProps={{ textField: { size: 'small' } }}
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              minDate={dayjs().add(1, 'day')}
            />

            <DatePicker
              slotProps={{ textField: { size: 'small' } }}
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              minDate={startDate || undefined}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={!isWalletConnected || isSubmitting || !entryFee || !startDate || !endDate}>
              {!isWalletConnected ? 'Please Connect Wallet' : isSubmitting ? 'Submitting...' : 'Create Battle'}
            </Button>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          Create Battle Failed: {error}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
