import express, { Application } from 'express';

import Vault from './Vault';
import sendTransaction from './sendTransaction';
import { BugsnagPluginExpressResult, TransactionsReqBody } from './types';
import Db from './Db';

export default class HttpServer {
  app: Application;
  port: number;
  vault: Vault;
  db: Db;
  bugsnag: BugsnagPluginExpressResult;

  constructor({
    port,
    vault,
    db,
    bugsnag,
  }: {
    port: number;
    vault: Vault;
    db: Db;
    bugsnag: BugsnagPluginExpressResult;
  }) {
    this.port = port;
    this.vault = vault;
    this.db = db;
    this.bugsnag = bugsnag;

    this.app = express();

    this.app.use(this.bugsnag.requestHandler);
    this.app.use(express.json());

    this.app.get('/', (req: any, res) => {
      return res.json({ service: 'ridvan' });
    });

    this.app.post('/transactions', async (req: any, res) => {
      const body: TransactionsReqBody = req.body;

      const address = await this.db.getAddress({
        address: body.params.from as string,
        network_key: body.network_key,
      });

      if (!address) {
        return res.status(400).json({
          errors: [{ title: 'address not found', detail: `address not found` }],
          jsonapi: { version: '1.0' },
        });
      }

      const node = await this.db.getNode({
        network_key: body.network_key,
        node_id: body.node_id,
      });

      if (!node) {
        return res.status(400).json({
          errors: [{ title: 'node not found', detail: 'node not found' }],
          jsonapi: { version: '1.0' },
        });
      }

      const pk = await this.vault.decrypt({
        ciphertext: address.key_encrypted,
      });

      if (!pk) {
        return res.status(500).json({ message: 'vault decrypt error' });
      }

      const response = await sendTransaction({
        params: body.params,
        pk,
        nodeUrl: node.url,
      });

      if (response.status !== 'OK') {
        return res.status(500).json({
          errors: [{ title: 'sendTransaction error', detail: `...` }],
          jsonapi: { version: '1.0' },
        });
      }

      return res.status(200).json({
        data: { type: 'transactions', attributes: response.data },
        jsonapi: { version: '1.0' },
      });
    });

    this.app.use(this.bugsnag.errorHandler);
  }

  async start(): Promise<void> {
    this.app.listen(this.port, '0.0.0.0');
    console.log(`http server started on ${this.port}`);
  }
}
