import idlContent from '@/assets/dictation_battle.idl?raw';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';

export const copyToClipboard = (value: string) =>
  navigator.clipboard.writeText(value).then(() => console.log('Copied!'));

export let sails: Sails;

SailsIdlParser.new().then((parser) => {
  sails = new Sails(parser);
  sails.parseIdl(idlContent);
});
