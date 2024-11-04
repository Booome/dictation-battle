import { useContract } from '@/hocs/ContractProvider';
import { useAccount } from '@gear-js/react-hooks';
import { Box, Button, Paper, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { web3FromSource } from '@polkadot/extension-dapp';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';

export function CreateBattle() {
  const [entryFee, setEntryFee] = useState<string>('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contract = useContract();
  const { account } = useAccount();
  const isWalletConnected = !!account;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const entryFeeNumber = Number.parseInt(entryFee);
    const timeZone = dayjs().utcOffset() / 60;
    const startDateNumber = startDate ? Math.floor(startDate.valueOf() / 1000) : 0;
    const endDateNumber = endDate ? Math.floor(endDate.valueOf() / 1000) : 0;

    console.log('entryFeeNumber:', entryFeeNumber);
    console.log('timeZone:', timeZone);
    console.log('startDateNumber:', startDateNumber);
    console.log('endDateNumber:', endDateNumber);

    try {
      const transaction = contract.services.DictationBattle.functions.CreateBattle(
        entryFeeNumber,
        timeZone,
        startDateNumber,
        endDateNumber,
      );
      if (!account?.address || !account?.meta?.source) {
        throw new Error('Wallet not connected');
      }

      const injector = await web3FromSource(account.meta.source);
      transaction.withAccount(account.address, { signer: injector.signer });
      const calculatedGas = await transaction.calculateGas();

      console.log('calculatedGas:', calculatedGas);
      console.log('response:', transaction);
    } catch (error) {
      console.error('error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Entry Fee" type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} />

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              minDate={dayjs().add(1, 'day')}
            />

            <DatePicker
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
    </LocalizationProvider>
  );
}
