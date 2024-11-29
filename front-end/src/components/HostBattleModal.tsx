import { useContract } from '@/hocs/ContractProvider';
import { gearSendMessage } from '@/types/utils';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { Alert, Box, Button, InputAdornment, Snackbar, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useEffect, useState } from 'react';
import { BaseModal } from './BaseModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const HostBattleModal = ({ open, onClose }: Props) => {
  const [name, setName] = useState('');
  const [entryFee, setEntryFee] = useState(1);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { account } = useAccount();
  const { api } = useApi();
  const { metadata, programId } = useContract();

  useEffect(() => {
    setShowSuccess(false);
  }, [open]);

  const isFormValid = (): boolean => {
    return Boolean(name && entryFee && startDate && endDate && endDate?.isAfter(startDate));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError('');
  };

  const handleEntryFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntryFee(Number(e.target.value));
    setError('');
  };

  const handleStartDateChange = (newValue: dayjs.Dayjs | null) => {
    setStartDate(newValue);
    setError('');
  };

  const handleEndDateChange = (newValue: dayjs.Dayjs | null) => {
    setEndDate(newValue);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!startDate || !endDate || !api) {
      return;
    }

    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const timeZoneOffset = new Date().getTimezoneOffset();
    const timezone = -(timeZoneOffset / 60);
    const startTime = startDate.valueOf() / 1000;
    const endTime = endDate.add(1, 'day').valueOf() / 1000;

    if (!account || !api || !programId || !metadata) {
      throw new Error('Wallet not connected');
    }

    const message = {
      destination: programId as `0x${string}`,
      payload: {
        CreateChallenge: {
          name,
          entryFee: entryFee * 10 ** 12,
          timezone,
          startTime,
          endTime,
        },
      },
      gasLimit: 750000000000,
    };

    gearSendMessage(api, account, metadata, message)
      .then((decodedPayload) => {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
          sx={{
            width: '60%',
            maxWidth: '34rem',
            backgroundColor: 'white',
            margin: 'auto',
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
          <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Host A Battle</Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ fontWeight: 500, textAlign: 'center', mt: 2 }}>Name</Box>
            <TextField
              fullWidth
              size="small"
              type="text"
              value={name}
              onChange={handleNameChange}
              disabled={isSubmitting}
              sx={{ '& input': { textAlign: 'center' } }}
            />

            <Box sx={{ fontWeight: 500, textAlign: 'center', mt: 2 }}>Entry Fee</Box>
            <TextField
              fullWidth
              size="small"
              type="number"
              defaultValue={entryFee}
              onChange={handleEntryFeeChange}
              disabled={isSubmitting}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">TVARA</InputAdornment>,
                },
                htmlInput: {
                  step: 0.000000000001,
                },
              }}
              sx={{ '& input': { textAlign: 'center' } }}
            />
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                mt: 2,
              }}>
              <Box sx={{ fontWeight: 500, textAlign: 'center' }}>Start Date</Box>
              <DateTimePicker
                views={['year', 'month', 'day']}
                minDate={dayjs().add(1, 'day')}
                format="YYYY-MM-DD"
                value={startDate}
                onChange={handleStartDateChange}
                disabled={isSubmitting}
                slotProps={{
                  textField: { size: 'small', fullWidth: true, sx: { '& input': { textAlign: 'center' } } },
                }}
              />
              <Box sx={{ fontWeight: 500, textAlign: 'center', mt: 2 }}>End Date</Box>
              <DateTimePicker
                views={['year', 'month', 'day']}
                minDate={startDate?.add(1, 'day') || dayjs().add(1, 'day')}
                format="YYYY-MM-DD"
                value={endDate}
                onChange={handleEndDateChange}
                disabled={isSubmitting}
                slotProps={{
                  textField: { size: 'small', fullWidth: true, sx: { '& input': { textAlign: 'center' } } },
                }}
              />
            </Box>
          </LocalizationProvider>

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
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Host Battle Success!
        </Alert>
      </Snackbar>
    </>
  );
};
