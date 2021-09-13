import express, { Application } from 'express';

import Vault from './Vault';
import sendTransaction from './sendTransaction';
import { TransactionsReqBody } from './types';
import Db from './Db';

export default class HttpServer {
  app: Application;
  port: number;
  vault: Vault;
  db: Db;

  constructor({ port, vault, db }: { port: number; vault: Vault; db: Db }) {
    this.port = port;
    this.vault = vault;
    this.db = db;
    this.app = express();

    this.app.use(express.json());

    this.app.get('/', (req: any, res) => {
      return res.json({ service: 'ridvan' });
    });

    this.app.post('/transactions', async (req: any, res) => {
      const body: TransactionsReqBody = req.body;

      const address = await this.db.getAddress({
        address: body.params.from as string,
      });

      if (!address) {
        return res.status(404).json({ message: 'address not found' });
      }

      const node = await this.db.getNode({
        network_key: body.network_key,
        node_id: body.node_id,
      });

      if (!node) {
        return res.status(404).json({ message: 'node not found' });
      }

      const pk = await this.vault.decrypt({
        ciphertext: address.key_encrypted,
      });

      if (!pk) {
        return res.status(500).json({ message: 'vault encrypt error' });
      }

      const response = await sendTransaction({
        params: body.params,
        pk,
        nodeUrl: node.url,
      });

      if (response.status !== 'OK') {
        return res.status(500).json({ message: response.message });
      }

      return res.status(200).json({ tx_id: response.tx_id });
    });
  }

  async start(): Promise<void> {
    this.app.listen(this.port, '0.0.0.0');
    console.log(`http server started on ${this.port}`);
  }
}
