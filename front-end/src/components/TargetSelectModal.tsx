import { Box } from '@mui/material';
import { BaseModal } from './BaseModal';
import { TargetViewer } from './TargetViewer';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (target: string) => void;
};

export function TargetSelectModal({ open, onClose, onSelect }: Props) {
  return (
    <BaseModal open={open} onClose={onClose}>
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '60%',
          minHeight: '50%',
          maxHeight: '90%',
          bgcolor: 'white',
          margin: 'auto',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
        <TargetViewer
          category="favorite"
          showInfoBar={false}
          onSelect={(target) => {
            onSelect(target);
            onClose();
          }}
          emptyMessage="No favorite targets"
        />
      </Box>
    </BaseModal>
  );
}
