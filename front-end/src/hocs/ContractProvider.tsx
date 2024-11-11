import idlContent from '@/assets/dictation_battle.idl?raw';
import { VARA_PROGRAM_ID } from '@/consts';
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';

const ContractContext = createContext<Sails | null>(null);

export function useContract() {
  return useContext(ContractContext);
}

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [contract, setContract] = useState<Sails | null>(null);
  const initStarted = useRef(false);

  useEffect(() => {
    if (initStarted.current) {
      return;
    }
    initStarted.current = true;

    const init = async () => {
      const parser = await SailsIdlParser.new();
      const instance = new Sails(parser);

      console.log('parseIdl:', idlContent);
      instance.parseIdl(idlContent);

      console.log('setProgramId:', VARA_PROGRAM_ID);
      instance.setProgramId(VARA_PROGRAM_ID);

      setContract(instance);
    };
    init();

    return () => {
      initStarted.current = false;
    };
  }, []);

  return <ContractContext.Provider value={contract}>{children}</ContractContext.Provider>;
}
