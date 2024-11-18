import { BACKEND_URL } from '@/consts';
import { MarkdownThemeProvider } from '@/hocs/ThemProviders';
import { Markdown } from '@/types/Markdown';
import { fetchTargetMarkdown, getWordCount } from '@/types/utils';
import { useAccount } from '@gear-js/react-hooks';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Box, Divider, Tooltip, Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { forwardRef, useEffect, useState } from 'react';
import { visit } from 'unist-util-visit';
import { BattleSelectModal } from './BattleSelectModal';
import { ChallengeModal } from './ChallengeModal';

type Props = {
  target: string;
  onClick?: (target: string) => void;
  showInfoBar?: boolean;
};

export const TargetCard = forwardRef<HTMLDivElement, Props>(({ target, onClick, showInfoBar = true }, ref) => {
  const [openChallengeModal, setOpenChallengeModal] = useState(false);
  const [openBattleSelectModal, setOpenBattleSelectModal] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState<number>(0);

  return (
    <Box
      ref={ref}
      onClick={() => onClick?.(target)}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
      }}>
      <MarkdownRenderer
        target={target}
        onStartChallenge={() => setOpenBattleSelectModal(true)}
        showInfoBar={showInfoBar}
      />

      <BattleSelectModal
        open={openBattleSelectModal}
        onClose={() => setOpenBattleSelectModal(false)}
        onSelect={(id) => {
          setSelectedBattleId(id);
          setOpenBattleSelectModal(false);
          setOpenChallengeModal(true);
        }}
      />
      <ChallengeModal
        target={target}
        battle={selectedBattleId}
        open={openChallengeModal}
        onClose={() => setOpenChallengeModal(false)}
      />
    </Box>
  );
});

function MarkdownRenderer({
  target,
  onStartChallenge,
  showInfoBar = true,
}: {
  target: string;
  onStartChallenge: () => void;
  showInfoBar?: boolean;
}) {
  const [markdown, setMarkdown] = useState<Markdown>();
  const [elements, setElements] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (target) {
      fetchTargetMarkdown(target).then(setMarkdown);
    }
  }, [target]);

  useEffect(() => {
    if (!markdown) {
      return;
    }

    const wordCount = getWordCount(markdown.text.split('\n').slice(1).join(' '));
    const eles: React.ReactNode[] = [];
    let elementIndex = 0;

    visit(markdown.tree, (node) => {
      switch (node.type) {
        case 'root':
          break;
        case 'heading':
          eles.push(
            <Typography key={`${elementIndex++}`} variant={`h${node.depth}` as Variant} sx={{ mb: 1 }}>
              {node.children[0].value}
            </Typography>,
          );
          if (node.depth === 1 && showInfoBar) {
            eles.push(
              <InfoRenderer
                key={`${elementIndex++}`}
                onStartChallenge={onStartChallenge}
                wordCount={wordCount}
                target={target}
              />,
            );
          }
          break;
        case 'paragraph':
          eles.push(
            <Typography key={`${elementIndex++}`} variant={'body1' as Variant} sx={{ mb: 1 }}>
              {node.children[0].value}
            </Typography>,
          );
          break;
        case 'image':
          eles.push(<ImageRenderer key={`${elementIndex++}`} imagePath={node.url} />);
          break;
        case 'text':
          break;
        default:
          throw new Error(`Not implemented node type: ${node.type}`);
      }
    });

    setElements(eles);
  }, [markdown]);

  return <MarkdownThemeProvider>{elements}</MarkdownThemeProvider>;
}

function ImageRenderer({ imagePath }: { imagePath: string }) {
  if (imagePath.startsWith('./')) {
    imagePath = imagePath.slice(2);
  }
  const imageUrl = `${BACKEND_URL}/${imagePath}`;
  return (
    <Box
      component="img"
      src={imageUrl}
      alt=""
      sx={{
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        display: 'block',
        filter: 'grayscale(100%)',
        my: 1,
      }}
    />
  );
}

function InfoRenderer({
  wordCount,
  target,
  onStartChallenge,
}: {
  wordCount: number;
  target: string;
  onStartChallenge: () => void;
}) {
  const { account } = useAccount();
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchFavorites = () => {
    fetch(`${BACKEND_URL}/favorites?account=${account?.address}`)
      .then((res) => res.json())
      .then((favorites) => {
        setIsFavorite(favorites.includes(target));
      });
  };

  const pushFavorite = (value: boolean) => {
    fetch(`${BACKEND_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: account?.address,
        target,
        value,
      }),
    });
  };

  useEffect(() => {
    if (account) {
      fetchFavorites();
    }
  }, [account]);

  const handleFavoriteClick = (value: boolean) => {
    setIsFavorite(value);
    pushFavorite(value);

    setTimeout(() => {
      fetchFavorites();
    }, 100);
  };

  return (
    <Box sx={{ width: '75%', margin: '0 auto' }}>
      <Divider sx={{ borderColor: 'primary.main' }} />
      <Box
        sx={{ width: '80%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant={'body1' as Variant} sx={{ my: 1, fontStyle: 'italic' }}>
          Total {wordCount} words
        </Typography>

        <Box>
          {account &&
            (isFavorite ? (
              <Tooltip title="Unfavorite">
                <FavoriteIcon
                  sx={{
                    color: 'grey.800',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'grey.600',
                    },
                  }}
                  onClick={() => handleFavoriteClick(false)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Add to favorites">
                <FavoriteBorderIcon
                  sx={{
                    color: 'grey.500',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'grey.800',
                    },
                  }}
                  onClick={() => handleFavoriteClick(true)}
                />
              </Tooltip>
            ))}

          {account && (
            <Tooltip title="Start Challenge">
              <PlayCircleOutlineIcon
                sx={{ color: 'grey.800', cursor: 'pointer', marginLeft: 1, '&:hover': { color: 'grey.600' } }}
                onClick={onStartChallenge}
              />
            </Tooltip>
          )}
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'primary.main' }} />
    </Box>
  );
}
