import { BACKEND_URL } from '@/consts';
import { GearApi, ProgramMetadata } from '@gear-js/api';
import { Account } from '@gear-js/react-hooks';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Markdown } from './Markdown';

dayjs.extend(utc);

export function getWordCount(text: string) {
  return text.split(/[\s\u200B\u200C\u200D\uFEFF]+/).filter((word) => word.length > 0).length;
}

export function traverseAny(input: any, callback: (root: string, key: string, value: any) => boolean) {
  const queue: Array<{ path: string; key: string; value: any }> = [];

  if (Array.isArray(input)) {
    input.forEach((value, index) => {
      queue.push({ path: '', key: index.toString(), value });
    });
  } else if (input && typeof input === 'object') {
    Object.entries(input).forEach(([key, value]) => {
      queue.push({ path: '', key, value });
    });
  }

  while (queue.length > 0) {
    const { path, key, value } = queue.shift()!;

    if (!callback(path, key, value)) {
      break;
    }

    if (value && typeof value === 'object') {
      const nextPath = path ? `${path}.${key}` : key;
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          queue.push({ path: nextPath, key: index.toString(), value: item });
        });
      } else {
        Object.entries(value).forEach(([k, v]) => {
          queue.push({ path: nextPath, key: k, value: v });
        });
      }
    }
  }
}

export function timestampToString(timestamp: number, timezone: number) {
  return (
    dayjs
      .unix(timestamp)
      .utc()
      .utcOffset(timezone * 60)
      .format('MM-DD-YYYY HH:mm UTC') +
    (timezone >= 0 ? '+' : '') +
    timezone
  );
}

export async function fetchTargetMarkdown(target: string): Promise<Markdown> {
  try {
    const response = await fetch(`${BACKEND_URL}/targets/${target}`);
    const text = await response.text();
    return new Markdown(text);
  } catch (error) {
    throw error;
  }
}

export function gearSendMessage(api: GearApi, account: Account, metadata: ProgramMetadata, message: any) {
  return new Promise((resolve, reject) => {
    (async () => {
      let error = '';
      let decodedPayload: any;
      api.setSigner(account.signer);

      let unsub = await api.gearEvents.subscribeToGearEvent('UserMessageSent', (event) => {
        const typeIndex = metadata.getTypeIndexByName('Result<ChronoQuestIoEvent, ChronoQuestIoError>');
        decodedPayload = metadata.createType(typeIndex!, event.data.message.payload).toHuman() as any;

        if ('Error' in decodedPayload) {
          error = JSON.stringify(decodedPayload);
        }
      });

      api.message
        .send(message, metadata)
        .signAndSend(account.address, (event) => {
          if (event.isFinalized) {
            unsub();
            if (!error) {
              resolve(decodedPayload);
            } else {
              reject(error);
            }
          }
        })
        .catch((err) => {
          unsub();
          reject(err);
        });
    })().catch((err) => {
      reject(err);
    });
  });
}
