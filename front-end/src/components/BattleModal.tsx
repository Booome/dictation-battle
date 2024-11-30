import { Markdown } from '@/types/Markdown';
import { fetchTargetMarkdown, getWordCount } from '@/types/utils';
import { useAccount } from '@gear-js/react-hooks';
import { Box, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import { BaseModal } from './BaseModal';
import { ChallengeModal } from './ChallengeModal';
import { TargetSelectModal } from './TargetSelectModal';

dayjs.extend(utc);
dayjs.extend(timezone);

type Props = {
  open: boolean;
  onClose: () => void;
  battle: any;
};

export function BattleModal({ open, onClose, battle }: Props) {
  const { account } = useAccount();
  const [missedDays, setMissedDays] = useState<string[]>(['2024-11-28']);
  const [completedDays, setCompletedDays] = useState<string[]>(['2024-11-27']);
  const [targetId, setTargetId] = useState<string>('');
  const [targetMarkdown, setTargetMarkdown] = useState<Markdown>();
  const [openTargetSelectModal, setOpenTargetSelectModal] = useState(false);
  const [openChallengeModal, setOpenChallengeModal] = useState(false);
  const timezone = battle.timezone;
  const startTime = parseInt(battle.startTime.replace(/,/g, '')) * 1000;
  const endTime = parseInt(battle.endTime.replace(/,/g, '')) * 1000;

  const fetchBattle = () => {
    if (!account || !open) {
      return;
    }

    const participantInfo = battle.participants.find((p: any) => p.id === account.decodedAddress);
    const completedDays = participantInfo.completedDays;
    const missed = [];
    const completed = [];

    for (let i = 0; ; i++) {
      const timestamp = startTime + i * 86400000;
      if (timestamp > endTime) {
        break;
      }
      const date = dayjs(timestamp).utcOffset(timezone).format('YYYY-MM-DD');
      if (completedDays.includes(i.toString())) {
        completed.push(date);
      } else {
        missed.push(date);
      }
    }

    setMissedDays(missed);
    setCompletedDays(completed);
  };

  useEffect(() => {
    fetchBattle();
  }, [open, battle]);

  useEffect(() => {
    if (targetId) {
      fetchTargetMarkdown(targetId).then((markdown) => setTargetMarkdown(markdown));
    }
  }, [targetId]);

  return (
    <BaseModal open={open} onClose={onClose}>
      <Box sx={{ bgcolor: 'white', margin: 'auto', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <Box sx={{ fontSize: '1rem', fontWeight: 500, textAlign: 'left', mb: 1 }}>Battle #{battle.id}</Box>
        <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>Daily Challenge</Box>
        <CalendarView missedDays={missedDays} completedDays={completedDays} timezone={timezone} />
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 2, textTransform: targetMarkdown ? 'none' : 'uppercase' }}
          onClick={() => setOpenTargetSelectModal(true)}>
          {targetMarkdown
            ? `${targetMarkdown.title} (${getWordCount(targetMarkdown.content)} words)`
            : 'Select Target Article'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="contained"
            sx={{ width: '45%' }}
            disabled={!targetId}
            onClick={() => setOpenChallengeModal(true)}>
            Start
          </Button>

          <Button variant="outlined" onClick={onClose} sx={{ width: '45%' }}>
            Cancel
          </Button>
        </Box>
      </Box>

      <TargetSelectModal
        open={openTargetSelectModal}
        onClose={() => setOpenTargetSelectModal(false)}
        onSelect={setTargetId}
      />

      <ChallengeModal
        target={targetId}
        battle={battle.id}
        open={targetId !== undefined && openChallengeModal}
        onClose={() => setOpenChallengeModal(false)}
        onSucceed={() => {
          setOpenChallengeModal(false);
          fetchBattle();
        }}
      />
    </BaseModal>
  );
}

function CalendarView({
  missedDays,
  completedDays,
  timezone,
}: {
  missedDays: string[];
  completedDays: string[];
  timezone: number;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        views={['day']}
        readOnly={true}
        showDaysOutsideCurrentMonth={false}
        timezone={`Etc/GMT${timezone >= 0 ? '-' : '+'}${Math.abs(timezone)}`}
        slots={{
          day: (props) => {
            const formattedDate = props.day.utcOffset(timezone).format('YYYY-MM-DD');
            const isMissed = missedDays.includes(formattedDate);
            const isCompleted = completedDays.includes(formattedDate);
            return (
              <Box
                sx={{
                  position: 'relative',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isMissed ? '#ffebee' : isCompleted ? '#e8f5e9' : 'transparent',
                  borderRadius: '50%',
                  border: props.today ? '1px solid black' : 'none',
                }}>
                {props.day.date()}
                {(isMissed || isCompleted) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      bgcolor: isMissed ? '#ef5350' : '#4caf50',
                    }}
                  />
                )}
              </Box>
            );
          },
        }}
        sx={{
          width: '40rem',
          height: '40rem',
          bgcolor: '#0001',
          '& .MuiPickersDay-root': {
            cursor: 'default',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
          '& .MuiPickersDay-today': {
            border: '1px solid black',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
          '& .Mui-selected': {
            backgroundColor: 'transparent !important',
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
