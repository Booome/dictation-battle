import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type PreviewCardProps = {
  id: string;
  content: string;
  numWords: number;
};

export function PreviewCard({ id, content, numWords }: PreviewCardProps) {
  const navigate = useNavigate();

  return (
    <Box
      component="button"
      sx={{
        borderRadius: '10px',
        padding: '20px',
        width: '250px',
        height: '250px',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        transform: 'scale(1)',
        transition: 'transform 0.3s ease-in-out',

        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(transparent, #fff)',
          pointerEvents: 'none',
        },

        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
      onClick={() => navigate(`/target/${id}`)}
      type="button">
      {content}
    </Box>
  );
}
