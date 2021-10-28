import path from 'path';
import pgPromise, { IDatabase } from 'pg-promise';
import { VaultOptions } from 'node-vault';

import Db from '../Db';
import getConfig from '../config';
import { Config } from '../types';
import Vault from '../Vault';

import { testAddress, testNode, addressPk } from './data';

let config: Config;

try {
  config = getConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const vaultRootOptions: VaultOptions = {
  apiVersion: 'v1',
  endpoint: config.vault.endpoint,
  token: config.vault.devRootToken,
};

const vaultRoot = new Vault({
  options: vaultRootOptions,
  encryptionKey: config.vault.encryptionKey,
});

const vaultOptions: VaultOptions = {
  apiVersion: 'v1',
  endpoint: config.vault.endpoint,
  token: config.vault.token,
};

let vault = new Vault({
  options: vaultOptions,
  encryptionKey: config.vault.encryptionKey,
});

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

  await vaultRoot.initTransitSecretEngine({
    type: 'transit',
    encryptionKey: 'ridvan_address',
    mount_point: 'transit',
  });

  await vaultRoot.createPolicy({
    policyName: 'ridvan-transit',
    policy:
      'path "transit/keys/ridvan_*" {\n capabilities = ["create", "read","list"]\n}\n\npath "transit/encrypt/ridvan_*" {\n capabilities = ["create", "read","update"]\n}\n\npath "transit/decrypt/ridvan_*" {\n capabilities = ["create", "read","update"]\n}\n',
  });

  const { token } = await vaultRoot.createToken({
    policies: ['ridvan-transit'],
    renewable: true,
    ttl: '5m',
    user: 'test',
  });

  vault = new Vault({
    options: {
      apiVersion: 'v1',
      endpoint: config.vault.endpoint,
      token,
    },
    encryptionKey: config.vault.encryptionKey,
  });

  return await pgpdb.tx(async (tx) => {
    await db.runQueryFromFile(
      path.resolve(__dirname, '../sql/migrations/001.sql'),
      tx
    );

    await db.runQueryFromFile(
      path.resolve(__dirname, '../sql/migrations/002.sql'),
      tx
    );
  });
});

afterAll(async () => {
  db.pgpdb.$pool.end();
  await tmppgpdb.none(`DROP DATABASE IF EXISTS ${dbName};`);
  tmppgpdb.$pool.end();
  pgp.end();
});

describe('Database', () => {
  test('add address', async () => {
    expect.assertions(1);

    const key_encrypted = await vault.encrypt({
      plaintext: addressPk[testAddress.address],
    });

    if (!key_encrypted) {
      throw new Error('vault encrypt error');
    }

    testAddress.key_encrypted = key_encrypted;

    const result = await db.addAddress(testAddress);

    expect(result).toMatchObject(result);
  });

  test('add node', async () => {
    expect.assertions(1);

    const result = await db.addNode({
      description: testNode.description,
      network_key: testNode.network_key,
      url: testNode.url,
    });

    expect(result).toMatchObject({
      ...result,
      ...{
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    });
  });

  test('get address', async () => {
    expect.assertions(1);
    const address = await db.getAddress({
      address: testAddress.address,
      network_key: testAddress.network_key,
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
        updated_at: expect.any(String),
      },
    });
  });
});
