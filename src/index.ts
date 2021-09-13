import util from 'util';
import { VaultOptions } from 'node-vault';
import pgPromise from 'pg-promise';

import getConfig from './config';
import { Config } from './types';
import Vault from './Vault';
import HttpServer from './HttpServer';
import Db from './Db';

let config: Config;

try {
  config = getConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

process.on('uncaughtException', (err: Error) => {
  console.log('Uncaught Exception:', util.inspect(err));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const vaultOptions: VaultOptions = {
  apiVersion: 'v1',
  endpoint: `http://${config.vault.host}:8200`,
  token: config.vault.token,
};

const vault = new Vault({ options: vaultOptions });

const pgp = pgPromise({
  error: (err: Error) => {
    const error = err as { cn?: unknown; code?: string; stack?: unknown };
    if (error.cn || error.code === '08S01') {
      console.log('pg-connection-error');
      process.exit(1);
    }
  },
});

const pgpdb = pgp(
  `postgres://${config.pg.user}:${config.pg.password}@${config.pg.host}:${config.pg.port}/${config.pg.database}`
);

const db = new Db({
  pgpdb,
});

const httpServer = new HttpServer({
  port: config.port,
  vault,
  db,
});

(async (): Promise<void> => {
  await vault.initTransitSecretEngine({
    type: 'transit',
    encryptionKey: 'transit',
    mount_point: 'transit',
  });
  await httpServer.start();

  console.log('service started');
})();
