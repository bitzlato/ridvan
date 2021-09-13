import vault, { client, VaultOptions } from 'node-vault';
import axios from 'axios';

const VAULT_TRANSIT_NAME = 'transit';

export default class Vault {
  private client: client;

  constructor({ options }: { options: VaultOptions }) {
    this.client = vault(options);
  }

  async encrypt({ plaintext }: { plaintext: string }): Promise<string | null> {
    try {
      const r = await this.client
        .encryptData({
          name: VAULT_TRANSIT_NAME,
          plaintext: Buffer.from(plaintext).toString('base64'),
        })
        .catch((error) => {
          console.error(error);
        });

      return r;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async decrypt({
    ciphertext,
  }: {
    ciphertext: string;
  }): Promise<string | null> {
    try {
      const response = await this.client.decryptData({
        name: VAULT_TRANSIT_NAME,
        ciphertext,
      });

      return Buffer.from(response.data.plaintext, 'base64').toString('ascii');
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async initTransitSecretEngine({
    type,
    mount_point,
    encryptionKey,
  }: {
    type: 'transit';
    mount_point: string;
    encryptionKey: string;
  }): Promise<void> {
    await this.createSecretEngine({
      type,
      mount_point,
    });
    await this.createEncryptionKey({
      mount_point,
      encryptionKey,
    });
    console.log('transit secret engine initialized');
  }
  async createSecretEngine({
    type,
    mount_point,
    description,
  }: {
    type: 'transit';
    mount_point: string;
    description?: string;
  }): Promise<void> {
    const response = await this.client
      .mount({
        mount_point,
        type,
        description,
      })
      .catch((error) => {
        console.error(error);
        if (!error.message?.includes('path is already in use')) {
          throw new Error(error);
        } else {
          console.log('secret engine already exists');
        }
      });

    console.log('secret engine initialized');
  }

  async createEncryptionKey({
    mount_point,
    encryptionKey,
  }: {
    mount_point: string;
    encryptionKey: string;
  }): Promise<void> {
    try {
      await axios({
        url: `${this.client.endpoint}/v1/${mount_point}/keys/${encryptionKey}`,
        method: 'POST',
        headers: {
          'X-Vault-Token': this.client.token,
        },
      });
    } catch (error) {
      console.log(error.message);
    }

    console.log('encryption key initialized');
  }
}
