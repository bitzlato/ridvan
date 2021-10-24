import path from 'path';
import pgPromise, { IDatabase } from 'pg-promise';
import { VaultOptions } from 'node-vault';
import supertest, { SuperTest, Test } from 'supertest';
import jwt from 'jsonwebtoken';

import Db from '../Db';
import getConfig from '../config';
import { Config, DbAddressType } from '../types';
import Vault from '../Vault';

import { testAddress, testNode, addressPk } from './data';
import HttpServer from '../HttpServer';

let config: Config;
let request: SuperTest<Test>;

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

const addAddress = async (testAddress: DbAddressType) => {
  const key_encrypted = await vault.encrypt({
    plaintext: addressPk[testAddress.address],
  });

  if (!key_encrypted) {
    throw new Error('vault encrypt error');
  }

  await db.addAddress({
    ...testAddress,
    ...{ key_encrypted },
  });
};

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

const dbInit = async (): Promise<void> => {
  await db.addNode({
    description: testNode.description,
    network_key: testNode.network_key,
    url: testNode.url,
  });

  await addAddress({
    ...testAddress,
    ...{ address: '0xbc68B88775B929b7e11bd6cdb213A4bd7A8eeD9d' },
  });
};

let pgpdb: IDatabase<Record<string, unknown>>;
let db: Db;

let token = '';

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

  const { token: client_token } = await vaultRoot.createToken({
    policies: ['ridvan-transit'],
    renewable: true,
    ttl: '5m',
    user: 'test',
  });

  vault = new Vault({
    options: {
      apiVersion: 'v1',
      endpoint: config.vault.endpoint,
      token: client_token,
    },
    encryptionKey: config.vault.encryptionKey,
  });

  await pgpdb.tx(async (tx) => {
    await db.runQueryFromFile(
      path.resolve(__dirname, '../sql/migrations/001.sql'),
      tx
    );

    await db.runQueryFromFile(
      path.resolve(__dirname, '../sql/migrations/002.sql'),
      tx
    );
  });

  await dbInit();

  token = jwt.sign({}, config.tokenSecret, { expiresIn: '10m' });

  const httpServer = new HttpServer({
    db,
    config,
    port: 3000,
    vault,
  });

  request = supertest(httpServer.app);
});

afterAll(async () => {
  db.pgpdb.$pool.end();
  await tmppgpdb.none(`DROP DATABASE IF EXISTS ${dbName};`);
  tmppgpdb.$pool.end();
  pgp.end();
});

describe('HttpServer', () => {
  test('GET /vault_token', async () => {
    expect.assertions(1);

    const response = await request
      .get('/vault_token')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });

  test('POST /addresses', async () => {
    expect.assertions(1);

    const address = '0xD80a740Bd99f2e45539CB7f015A5cd63320E3d22';

    const response = await request
      .post('/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...testAddress,
        ...{
          address,
          pk: addressPk[address],
        },
      });

    expect(response.status).toBe(200);
  });

  test('POST /addresses/generate', async () => {
    expect.assertions(1);

    const response = await request
      .post('/addresses/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ network_key: 'ropsten', owner_kind: 'user' });

    expect(response.status).toBe(200);
  });

  test('POST /transactions', async () => {
    expect.assertions(1);

    let response = await request
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        network_key: 'ropsten',
        params: {
          to: '0xbc68B88775B929b7e11bd6cdb213A4bd7A8eeD9d',
          from: '0xD80a740Bd99f2e45539CB7f015A5cd63320E3d22',
          value: '10000000000000',
          gas: '21000',
        },
      });

    if (response.status !== 200) {
      response = await request
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          network_key: 'ropsten',
          params: {
            to: '0xD80a740Bd99f2e45539CB7f015A5cd63320E3d22',
            from: '0xbc68B88775B929b7e11bd6cdb213A4bd7A8eeD9d',
            value: '10000000000000',
            gas: '21000',
          },
        });
    }
    expect(response.status).toBe(200);
  });
});
