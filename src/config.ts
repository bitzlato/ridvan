import path from 'path';
import * as env from 'env-var';
import dotenv from 'dotenv';

import { Config } from './types';

if (process.env.DEBUG) {
  dotenv.config({
    path: path.resolve(process.cwd(), `env/local.env`),
  });
}

export default (): Config => ({
  port: env.get('PORT').required().asPortNumber(),
  vault: {
    host: env.get('VAULT_HOST').required().asString(),
    token: env.get('VAULT_TOKEN').required().asString(),
    encryptionKey: env
      .get('VAULT_ENCRIPTION_KEY')
      .default('transit')
      .required()
      .asString(),
  },
  pg: {
    host: env.get('PG_HOST').required().asString(),
    port: env.get('PG_PORT').required().asPortNumber(),
    database: env.get('PG_DATABASE').required().asString(),
    user: env.get('PG_USER').required().asString(),
    password: env.get('PG_PASSWORD').required().asString(),
  },
});
