import { Box } from '@mui/material';

type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  closeOnClick?: boolean;
};

export function BaseModal({ children, open, onClose, closeOnClick = true }: Props) {
  return (
    open && (
      <Box
        component="div"
        onClick={(e) => {
          e.stopPropagation();
          if (closeOnClick) {
            onClose();
          }
        }}
        sx={{
          display: 'flex',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(7.5px)',
        }}>
        {children}
      </Box>
    )
  );
}
