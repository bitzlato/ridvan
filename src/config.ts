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
  tokenSecret: env.get('TOKEN_SECRET').required().asString(),
  vault: {
    endpoint: env.get('VAULT_ENDPOINT').required().asString(),
    token: env.get('VAULT_TOKEN').required().asString(),
    devRootToken: env.get('VAULT_DEV_ROOT_TOKEN').required().asString(),
    encryptionKey: env
      .get('VAULT_ENCRYPTION_KEY')
      .default('ridvan_address')
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
  bugsnag: {
    apiKey: env.get('BUGSNAG_API_KEY').required().asString(),
  },
});
