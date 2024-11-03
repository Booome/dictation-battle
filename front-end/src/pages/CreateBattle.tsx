import { Box, Paper, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';

export function CreateBattle() {
  const [entryFee, setEntryFee] = useState<string>('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Entry Fee" type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} />

            <DateTimePicker label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />

            <DateTimePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              minDateTime={startDate || undefined}
            />
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
