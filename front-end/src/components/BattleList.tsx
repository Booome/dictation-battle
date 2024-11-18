import { useContract } from '@/hocs/ContractProvider';
import { timestampToString } from '@/types/utils';
import { useAccount, useApi } from '@gear-js/react-hooks';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BlenderOutlinedIcon from '@mui/icons-material/BlenderOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import OutlinedFlagOutlinedIcon from '@mui/icons-material/OutlinedFlagOutlined';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Box, Button, Grid2 as Grid, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { BattleModal } from './BattleModal';
import JoinBattleModal from './JoinBattleModal';

type Props = {
  filter: 'All' | 'Hosted' | 'Joined' | 'Sponsored';
  includeRecruiting: boolean;
  includeRecruitFailed: boolean;
  includeExecuting: boolean;
  includeCompleted: boolean;
  onJoinSucceed?: (id: number) => void;
  noActionButton?: boolean;
  onSelect?: (id: number) => void;
  emptyMessage?: string;
};

export function BattleList({
  filter,
  includeRecruiting,
  includeRecruitFailed,
  includeExecuting,
  includeCompleted,
  onJoinSucceed,
  noActionButton = false,
  onSelect,
  emptyMessage,
}: Props) {
  const { api } = useApi();
  const { account } = useAccount();
  const { programId, metadata } = useContract();
  const [battles, setBattles] = useState<any[]>([]);
  const [fetched, setFetched] = useState<boolean>(false);

  const queryBattles = async (): Promise<void> => {
    if (!api || !account) {
      return;
    }

    setFetched(false);
    let contractFilter;

    if (filter === 'All') {
      contractFilter = 'All';
    } else {
      contractFilter = {
        [`${filter}`]: account.decodedAddress,
      };
    }

    const state = await api.programState.read(
      {
        programId: programId as `0x${string}`,
        payload: {
          queryChallenges: {
            filter: contractFilter,
            includeRecruiting,
            includeRecruitFailed,
            includeExecuting,
            includeCompleted,
            offset: 0,
            count: 10,
          },
        },
      },
      metadata,
    );

    setBattles((state.toHuman() as any).QueryChallenges.challenges.reverse());
    setFetched(true);
  };

  useEffect(() => {
    queryBattles();
  }, [api, account, filter, includeRecruiting, includeRecruitFailed, includeExecuting, includeCompleted]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        overflow: 'auto',
        flex: 1,
        '&::-webkit-scrollbar': {
          width: '2px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '2px',
        },
        '&::-webkit-scrollbar-button': {
          display: 'none',
        },
        padding: '0.3rem',
        height: '100%',
      }}>
      {battles.map((battle) => (
        <BattleListItem
          battle={battle}
          key={battle.id}
          onJoinSucceed={onJoinSucceed}
          noActionButton={noActionButton}
          onClick={() => onSelect?.(parseInt(battle.id))}
        />
      ))}
      {fetched && emptyMessage && battles.length === 0 && (
        <Box sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{emptyMessage}</Box>
      )}
    </Box>
  );
}

function BattleListItem({
  battle,
  onJoinSucceed,
  noActionButton,
  onClick,
}: {
  battle: any;
  onJoinSucceed?: (id: number) => void;
  noActionButton?: boolean;
  onClick?: () => void;
}) {
  const [joinBattleModalOpen, setJoinBattleModalOpen] = useState(false);
  const { account } = useAccount();
  const [battleModalOpen, setBattleModalOpen] = useState(false);

  const id = battle.id;
  const name = battle.name;
  const status = battle.status;
  const timezone = battle.timezone;
  const creationTime = parseInt(battle.creationTime.replace(/,/g, ''));
  const startTime = parseInt(battle.startTime.replace(/,/g, ''));
  const endTime = parseInt(battle.endTime.replace(/,/g, ''));
  const entryFee = parseFloat(battle.entryFee.replace(/,/g, '')) / 10 ** 12;
  const joined = battle.participants.find((participant: any) => participant.id === account?.decodedAddress);

  const creationTimeString = timestampToString(creationTime, timezone);
  const startTimeString = timestampToString(startTime, timezone);
  const endTimeString = timestampToString(endTime, timezone);

  const BattleInfoItem = ({
    Icon,
    text,
    tooltip,
    size = 4,
  }: {
    Icon: React.ElementType;
    text: string;
    tooltip?: string;
    size?: number;
  }) => {
    return (
      <Grid size={size}>
        <Tooltip title={tooltip || text}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon sx={{ marginRight: '0.25rem' }} />
            {text}
          </Box>
        </Tooltip>
      </Grid>
    );
  };

  const onActionButtonClick = () => {
    if (!joined) {
      setJoinBattleModalOpen(true);
    } else {
      setBattleModalOpen(true);
    }
  };

  const ActionButton = () => {
    return (
      <Tooltip title={!joined ? 'JOIN' : 'CHALLENGE'}>
        <Button
          onClick={onActionButtonClick}
          sx={{
            bgcolor: '#0002',
            width: '10rem',
            borderRadius: '0 1rem 1rem 0',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            alignItems: 'center',
          }}>
          {!joined ? (
            <Box sx={{ fontSize: '1.5rem' }}>
              {entryFee.toFixed(5)}
              <Box sx={{ fontSize: '0.75rem' }}>TVRA</Box>
            </Box>
          ) : (
            <PlayCircleOutlineIcon sx={{ fontSize: '3rem' }} />
          )}
        </Button>
      </Tooltip>
    );
  };

  return (
    <Box onClick={onClick} sx={{ display: 'flex', flexDirection: 'row', bgcolor: '#0002', borderRadius: '1rem' }}>
      <Grid container sx={{ minHeight: '5rem', padding: '1rem 2rem', flex: 1 }}>
        <Grid size={6} sx={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          {name}
        </Grid>
        <BattleInfoItem Icon={AccessTimeOutlinedIcon} text={creationTimeString} tooltip="Creation Time" size={3} />
        <BattleInfoItem Icon={PlayCircleFilledWhiteOutlinedIcon} text={startTimeString} tooltip="Start Time" size={3} />
        <BattleInfoItem Icon={NumbersOutlinedIcon} text={id} tooltip="ID" size={6} />
        <BattleInfoItem Icon={OutlinedFlagOutlinedIcon} text={status} tooltip="Status" size={3} />
        <BattleInfoItem Icon={BlenderOutlinedIcon} text={endTimeString} tooltip="End Time" size={3} />
      </Grid>
      {!noActionButton && <ActionButton />}

      <JoinBattleModal
        open={joinBattleModalOpen}
        onClose={() => {
          setJoinBattleModalOpen(false);
        }}
        onJoinSucceed={() => {
          setJoinBattleModalOpen(false);
          onJoinSucceed?.(parseInt(id));
        }}
        battleId={id}
        entryFee={entryFee}
      />

      <BattleModal open={battleModalOpen} onClose={() => setBattleModalOpen(false)} battle={battle} />
    </Box>
  );
}
