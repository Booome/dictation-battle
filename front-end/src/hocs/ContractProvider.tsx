import idlContent from '@/assets/dictation_battle.idl?raw';
import { VARA_PROGRAM_ID } from '@/consts';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';

const ContractContext = createContext<Sails | null>(null);

export function useContract() {
  const contract = useContext(ContractContext);
  if (!contract) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return contract;
}

const initializeContract = async () => {
  const parser = await SailsIdlParser.new();
  const contract = new Sails(parser);

  console.log('idlContent:', idlContent);

  contract.parseIdl(idlContent);

  console.log('VARA_PROGRAM_ID:', VARA_PROGRAM_ID);
  contract.setProgramId(VARA_PROGRAM_ID);
  return contract;
};

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [contract, setContract] = useState<Sails | null>(null);

  useEffect(() => {
    if (!contract) {
      initializeContract().then(setContract);
    }
  }, [contract]);

  if (!contract) {
    return null;
  }

  return <ContractContext.Provider value={contract}>{children}</ContractContext.Provider>;
}
