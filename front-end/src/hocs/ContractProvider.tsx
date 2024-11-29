import metaContent from '@/assets/chrono_quest.meta.txt?raw';
import { VARA_PROGRAM_ID } from '@/consts';
import { ProgramMetadata } from '@gear-js/api';
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

type Contract = {
  metadata?: ProgramMetadata;
  programId?: string;
};

const ContractContext = createContext<Contract>({});

export function useContract() {
  return useContext(ContractContext);
}

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [contract, setContract] = useState<Contract>({});
  const initStarted = useRef(false);

  useEffect(() => {
    (async () => {
      if (initStarted.current) {
        return;
      }
      initStarted.current = true;

      const metadata = ProgramMetadata.from('0x' + metaContent);
      console.log('metadata:', metadata);

      setContract({ metadata, programId: VARA_PROGRAM_ID });
    })();
  }, []);

  return <ContractContext.Provider value={contract}>{children}</ContractContext.Provider>;
}
