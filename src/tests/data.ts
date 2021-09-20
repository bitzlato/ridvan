import { DbAddressType, DbNodeType } from '../types';

export const addressPk = {
  '0xbc68B88775B929b7e11bd6cdb213A4bd7A8eeD9d':
    '0xe74c2b4042d0bbc27abf0ff84a69ff16690f154334a9f627d2433013a01e5030',
  '0xD80a740Bd99f2e45539CB7f015A5cd63320E3d22':
    '0x23bec4faf7efb46c199c6a1879b942d10a7c06cb7dac3713e9d45b42f95f9541',
};

export const testAddress: DbAddressType = {
  network_key: 'ropsten',
  address: '0xbc68B88775B929b7e11bd6cdb213A4bd7A8eeD9d',
  key_encrypted: '',
  owner_kind: 'user',
  created_at: '2021-09-10 19:15:33.243271',
};

export const testNode: DbNodeType = {
  id: 1,
  description: 'testnet ropsten',
  network_key: 'ropsten',
  url: 'https://ropsten.infura.io/v3/420522fed32d483c992483e5ea415458',
  created_at: '',
  updated_at: '',
};
