import { ErrorRequestHandler, RequestHandler } from 'express';
import { TransactionConfig } from 'web3-core';

export type Config = {
  port: number;
  tokenSecret: string;
  vault: {
    endpoint: string;
    token: string;
    devRootToken?: string;
    encryptionKey: string;
  };
  pg: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  bugsnag: {
    apiKey: string;
  };
};

export interface TransactionsReqBody {
  network_key: string;
  node_id?: number;
  params: TransactionConfig;
}

export type DbAddressType = {
  created_at: string;
  network_key: string;
  address: string;
  key_encrypted: string;
  owner_kind: string;
};

export type DbNodeType = {
  id: number;
  description: string;
  network_key: string;
  url: string;
  created_at: string;
  updated_at: string;
};

export interface BugsnagPluginExpressResult {
  errorHandler: ErrorRequestHandler;
  requestHandler: RequestHandler;
}
