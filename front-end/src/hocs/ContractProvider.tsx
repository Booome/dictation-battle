import idlContent from '@/assets/dictation_battle.idl?raw';
import { ADDRESS, VARA_PROGRAM_ID } from '@/consts';
import { GearApi } from '@gear-js/api';
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
  contract.parseIdl(idlContent);
  const api = new GearApi({
    providerAddress: ADDRESS.NODE,
  });
  contract.setApi(api);
  contract.setProgramId(VARA_PROGRAM_ID);
  return contract;
};

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [contract, setContract] = useState<Sails | null>(null);

  useEffect(() => {
    initializeContract().then(setContract);
  }, []);

  if (!contract) {
    return null;
  }

  return <ContractContext.Provider value={contract}>{children}</ContractContext.Provider>;
}
