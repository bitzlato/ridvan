import vault, { client, VaultOptions } from 'node-vault';
import axios from 'axios';

export default class Vault {
  private client: client;
  private encryptionKey: string;

  constructor({
    options,
    encryptionKey,
  }: {
    options: VaultOptions;
    encryptionKey: string;
  }) {
    this.client = vault(options);
    this.encryptionKey = encryptionKey;
  }

  async encrypt({ plaintext }: { plaintext: string }): Promise<string | null> {
    try {
      const response = await this.client.encryptData({
        name: this.encryptionKey,
        plaintext: Buffer.from(plaintext).toString('base64'),
      });

      return response.data.ciphertext;
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
        name: this.encryptionKey,
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
    await this.client
      .mount({
        mount_point,
        type,
        description,
      })
      .catch((error) => {
        if (!error.message?.includes('path is already in use')) {
          console.log('createSecretEngine error', error.message);
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

  async getVaultTokenAccessor(): Promise<{
    accessor: string;
    ttl: number;
  } | null> {
    try {
      const response: {
        data: {
          data: {
            accessor: string;
            ttl: number;
          };
        };
      } = await axios({
        url: `${this.client.endpoint}/v1/auth/token/lookup`,
        method: 'POST',
        headers: {
          'X-Vault-Token': this.client.token,
        },
        data: {
          token: this.client.token,
        },
      });
      return {
        accessor: response.data.data.accessor,
        ttl: response.data.data.ttl,
      };
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  async getSelfVaultTokenAccessor(): Promise<{
    accessor: string;
    ttl: number;
  } | null> {
    try {
      const response: {
        data: {
          data: {
            accessor: string;
            ttl: number;
          };
        };
      } = await axios({
        url: `${this.client.endpoint}/v1/auth/token/lookup-self`,
        method: 'GET',
        headers: {
          'X-Vault-Token': this.client.token,
        },
      });
      return {
        accessor: response.data.data.accessor,
        ttl: response.data.data.ttl,
      };
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  async createPolicy({
    policyName,
    policy,
  }: {
    policyName: string;
    policy: string;
  }): Promise<void> {
    try {
      await axios({
        url: `${this.client.endpoint}/v1/sys/policies/acl/${policyName}`,
        method: 'PUT',
        headers: {
          'X-Vault-Token': this.client.token,
        },
        data: {
          policy,
        },
      });
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  }

  async createToken({
    policies,
    user,
    ttl,
    renewable,
  }: {
    policies: Array<string>;
    user: string;
    ttl: string;
    renewable: boolean;
  }): Promise<{ token: string }> {
    try {
      const response: {
        data: {
          auth: {
            client_token: string;
          };
        };
      } = await axios({
        url: `${this.client.endpoint}/v1/auth/token/create`,
        method: 'PUT',
        headers: {
          'X-Vault-Token': this.client.token,
        },
        data: {
          policies,
          meta: { user },
          ttl,
          renewable,
        },
      });

      return { token: response.data.auth.client_token };
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  }
}
