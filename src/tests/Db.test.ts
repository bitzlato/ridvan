import pgPromise, { IDatabase } from 'pg-promise';
import { VaultOptions } from 'node-vault';

import Db from '../Db';
import getConfig from '../config';
import { Config } from '../types';
import Vault from '../Vault';

import { testAddress, testNode } from './data';

let config: Config;

try {
  config = getConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const vaultOptions: VaultOptions = {
  apiVersion: 'v1',
  endpoint: `http://${config.vault.host}:8200`,
  token: config.vault.token,
};

const vault = new Vault({ options: vaultOptions });

const pgp = pgPromise({});

let tmppgpdb: pgPromise.IDatabase<any>;
const dbName = `db_${Math.random().toString(32).slice(2)}`;

const createTestDatabase = async (): Promise<
  IDatabase<Record<string, unknown>>
> => {
  tmppgpdb = pgp(
    `postgres://${config.pg.user}:${config.pg.password}@${config.pg.host}:${config.pg.port}/postgres`
  );
  await tmppgpdb.none(`CREATE DATABASE ${dbName};`);
  const pgpdb = pgPromise<Record<string, unknown>>({})(
    `postgres://${config.pg.user}:${config.pg.password}@${config.pg.host}:${config.pg.port}/${dbName}`
  );

  return pgpdb;
};

let pgpdb: IDatabase<Record<string, unknown>>;
let db: Db;

beforeAll(async () => {
  pgpdb = await createTestDatabase();
  db = new Db({ pgpdb });
});

afterAll(async () => {
  db.pgpdb.$pool.end();
  await tmppgpdb.none(`DROP DATABASE IF EXISTS ${dbName};`);
  tmppgpdb.$pool.end();
  pgp.end();
});

describe('Database', () => {
  // test('add address', async () => {
  //   expect.assertions(1);
  // vault.encrypt(...)
  //   const result = await db.addAddress({});
  //   expect(result).toMatchObject({
  //     ...result,
  //     ...{
  //       created_at: expect.any(String),
  //     },
  //   });
  // });

  test('get address', async () => {
    expect.assertions(1);
    const address = await db.getAddress({
      address: testAddress.address,
    });
    expect(address).toMatchObject({
      ...testAddress,
      ...{
        created_at: expect.any(String),
      },
    });
  });

  test('get node', async () => {
    expect.assertions(1);
    const node = await db.getNode({
      network_key: testNode.network_key,
      node_id: testNode.id,
    });

    expect(node).toMatchObject({
      ...testNode,
      ...{
        created_at: expect.any(String),
      },
    });
  });
});
