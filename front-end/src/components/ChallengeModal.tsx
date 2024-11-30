import { useContract } from '@/hocs/ContractProvider';
import { Markdown } from '@/types/Markdown';
import { fetchTargetMarkdown, gearSendMessage, getWordCount } from '@/types/utils';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { Alert, Box, Button, Snackbar } from '@mui/material';
import { Change, diffWords } from 'diff';
import debounce from 'lodash.debounce';
import { useEffect, useRef, useState } from 'react';
import { BaseModal } from './BaseModal';

interface Props {
  open: boolean;
  onClose: () => void;
  onSucceed?: () => void;
  target: string;
  battle: number;
}

export function ChallengeModal({ open, onClose, onSucceed, target, battle }: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [diffing, setDiffing] = useState<boolean>(false);
  const [diff, setDiff] = useState<Change[]>([]);
  const [textAreaWordCount, setTextAreaWordCount] = useState<number>(0);
  const [correctWordCount, setCorrectWordCount] = useState<number>(0);
  const [incorrectWordCount, setIncorrectWordCount] = useState<number>(0);
  const [markdown, setMarkdown] = useState<Markdown>();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const { api } = useApi();
  const { account } = useAccount();
  const { programId, metadata } = useContract();
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (target) {
      fetchTargetMarkdown(target).then(setMarkdown);
    }
  }, [target]);

  const onContentChange = () => {
    const content = textAreaRef.current?.innerText ?? '';
    const diff = diffWords(markdown!.content, content);
    setDiff(diff);
    setCanSubmit(diff.length === 0 || diff.every((d) => !d.added && !d.removed));

    const correct = diff.filter((d) => !d.added && !d.removed).reduce((sum, d) => sum + getWordCount(d.value), 0);
    const incorrect = diff.filter((d) => d.added || d.removed).reduce((sum, d) => sum + getWordCount(d.value), 0);

    setCorrectWordCount(correct);
    setIncorrectWordCount(incorrect);
  };

  const handleInput = debounce(onContentChange, 300);

  useEffect(() => {
    if (open && markdown) {
      const wordCount = getWordCount(markdown.content);
      setTextAreaWordCount(wordCount);
      onContentChange();
    }
  }, [open, markdown]);

  useEffect(() => {
    if (open) {
      textAreaRef.current?.focus();
    } else {
      setDiffing(false);
      setDiff([]);
      setCorrectWordCount(0);
      setIncorrectWordCount(0);
    }
  }, [open]);

  const textAreaSx = {
    flexGrow: 1,
    overflow: 'hidden',
    border: 'none',
    outline: 'none',
    fontSize: '1.3rem',
    lineHeight: '1.5',
    padding: '0.2rem 2rem',
    borderTop: '2px solid #111',
    borderBottom: '2px solid #111',
    backgroundImage: 'repeating-linear-gradient(#0000 0rem, #0000 1.9rem, #111 1.95rem)',
    backgroundSize: '100% 1.95rem',
    backgroundAttachment: 'local',
  };

  const onSubmit = () => {
    (async () => {
      if (!api || !account || !metadata) {
        return;
      }

      setIsSubmitting(true);

      const message = {
        destination: programId as `0x${string}`,
        payload: {
          CompleteDaily: {
            id: battle,
          },
        },
        gasLimit: 750000000000,
      };

      gearSendMessage(api, account, metadata, message)
        .then((decodedPayload) => {
          console.log('decodedPayload: ', decodedPayload);
          setShowSuccess(true);
          setTimeout(() => {
            onSucceed?.();
          }, 3000);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    })();
  };

  return (
    <BaseModal open={open} onClose={onClose} closeOnClick={false}>
      <Box
        maxWidth="md"
        sx={{
          width: '80%',
          height: '100%',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <Box
          sx={{
            bgcolor: 'white',
            flexGrow: 1,
            overflow: 'hidden',
            marginTop: '1.5rem',
            borderRadius: 2,
            boxShadow: 9,
            padding: '1rem 1rem 2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <Box>Battle #{battle}</Box>
          <Box
            sx={{
              fontSize: '2rem',
              fontWeight: 600,
              px: '2rem',
              textAlign: 'center',
              mb: 1.5,
            }}>
            {markdown?.title}
          </Box>
          <Box sx={{ fontSize: '1.2rem', fontWeight: 400, textAlign: 'right', mb: 1, pr: 6 }}>
            <WordCountDisplay total={textAreaWordCount} correct={correctWordCount} incorrect={incorrectWordCount} />
          </Box>

          <Box sx={{ ...textAreaSx, display: diffing ? 'block' : 'none' }}>
            <DiffDisplay diff={diff} />
          </Box>
          <Box
            component="div"
            ref={textAreaRef}
            contentEditable={!diffing && !isSubmitting}
            onInput={handleInput}
            onPaste={(e) => {
              if (!isSubmitting) {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                const selection = window.getSelection();
                const range = selection?.getRangeAt(0);
                if (range) {
                  range.deleteContents();
                  range.insertNode(document.createTextNode(text));
                }
              }
            }}
            sx={{ ...textAreaSx, display: diffing ? 'none' : 'block' }}
          />
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" sx={{ width: '100%' }}>
            Challenge Submitted!
          </Alert>
        </Snackbar>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginY: '1rem' }}>
          <Box />
          <Button
            variant="contained"
            onClick={() => setDiffing(!diffing)}
            sx={{ width: '6rem', fontSize: '1.2rem', boxShadow: 9 }}
            disabled={isSubmitting}>
            {diffing ? 'RESUME' : 'DIFF'}
          </Button>
          <Button
            variant="contained"
            disabled={!canSubmit || isSubmitting}
            sx={{ width: '6rem', fontSize: '1.2rem', boxShadow: 9 }}
            onClick={onSubmit}>
            Submit
          </Button>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{ width: '6rem', fontSize: '1.2rem', boxShadow: 9 }}
            disabled={isSubmitting}>
            Cancel
          </Button>
          <Box />
        </Box>
      </Box>
    </BaseModal>
  );
}

function DiffDisplay({ diff }: { diff: Change[] }) {
  const renderChange = (change: Change) => {
    if (change.added == false && change.removed == true) {
      return (
        <Box component="span">
          {change.value.split('').map((char, index) => (
            <Box component="span" key={index} sx={{ textDecoration: char.trim() ? 'underline' : 'none' }}>
              {char.trim() ? '_' : char}
            </Box>
          ))}
        </Box>
      );
    }
    if (change.added == true && change.removed == false) {
      return (
        <Box component="span" sx={{ textDecoration: 'line-through' }}>
          {change.value}
        </Box>
      );
    }
    if (change.added == false && change.removed == false) {
      return <Box component="span">{change.value}</Box>;
    }
    return <Box component="span">{JSON.stringify(change)}</Box>;
  };

  return (
    <Box component="span">
      {diff.map((change, index) => (
        <Box component="span" sx={{ whiteSpace: 'pre-wrap' }} key={index}>
          {renderChange(change)}
        </Box>
      ))}
    </Box>
  );
}

function WordCountDisplay({ total, correct, incorrect }: { total: number; correct: number; incorrect: number }) {
  return (
    <>
      <Box component="span" sx={{ color: 'grey.500' }}>
        {total}{' '}
        <Box component="span" sx={{ fontStyle: 'italic', color: 'grey.500' }}>
          total
        </Box>
      </Box>
      <Box component="span" sx={{ mx: 2, color: 'grey.500' }}>
        |
      </Box>
      <Box component="span" sx={{ color: 'grey.500' }}>
        {correct}{' '}
        <Box component="span" sx={{ fontStyle: 'italic', color: 'grey.500' }}>
          ok
        </Box>
      </Box>
      <Box component="span" sx={{ mx: 2, color: 'grey.500' }}>
        |
      </Box>
      <Box component="span" sx={{ color: 'grey.500' }}>
        {incorrect}{' '}
        <Box component="span" sx={{ fontStyle: 'italic', color: 'grey.500' }}>
          diff
        </Box>
      </Box>
    </>
  );
}
