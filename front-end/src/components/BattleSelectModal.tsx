import { Box } from '@mui/material';
import { BaseModal } from './BaseModal';
import { BattleList } from './BattleList';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: (id: number) => void;
};

export function BattleSelectModal({ open, onClose, onSelect }: Props) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ width: '60%', minHeight: '50%', maxHeight: '90%', bgcolor: 'white', margin: 'auto', padding: '1.5rem' }}>
        <Box sx={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', mb: '1rem' }}>
          Select a Battle to Challenge
        </Box>

        <BattleList
          filter="All"
          includeRecruiting={false}
          includeRecruitFailed={false}
          includeExecuting={true}
          includeCompleted={false}
          noActionButton={true}
          onSelect={onSelect}
          emptyMessage="No executing joined battles"
        />
      </Box>
    </BaseModal>
  );
}
