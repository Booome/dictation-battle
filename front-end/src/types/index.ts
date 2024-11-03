import type { FunctionComponent, SVGProps } from 'react';

// in case Object.entries return value is immutable
// ref: https://stackoverflow.com/a/60142095
export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type SVGComponent = FunctionComponent<
  SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;
