import path from 'path';
import { IDatabase, QueryFile, ITask } from 'pg-promise';
import { DbAddressType, DbNodeType } from './types';

const QUERY_NAMES: Array<string> = [
  'addNode',
  'addAddress',
  'getNode',
  'getAddress',
];

const QUERY_FILES_DIR = path.resolve(__dirname, 'sql');

export default class Db {
  pgpdb: IDatabase<Record<string, unknown>>;
  queryFiles: Record<string, QueryFile>;

  constructor({ pgpdb }: { pgpdb: IDatabase<Record<string, unknown>> }) {
    this.pgpdb = pgpdb;
    this.queryFiles = {};
    this.loadQueryFiles();
  }

  loadQueryFiles(): void {
    QUERY_NAMES.forEach((queryName: string) => {
      const queryFile = new QueryFile(
        path.resolve(QUERY_FILES_DIR, `${queryName}.sql`)
      );
      this.queryFiles[queryName] = queryFile;
    });
  }

  async addNode({
    description,
    network_key,
    url,
  }: {
    description: string;
    network_key: string;
    url: string;
  }): Promise<DbNodeType> {
    const result = await this.pgpdb.one<DbNodeType>(this.queryFiles.addNode, {
      description,
      network_key,
      url,
    });

    return result;
  }

  async addAddress({
    network_key,
    address,
    key_encrypted,
    owner_kind,
    created_at,
  }: {
    address: string;
    network_key: string;
    key_encrypted: string;
    owner_kind: string;
    created_at: string;
  }): Promise<DbAddressType> {
    const result = await this.pgpdb.one<DbAddressType>(
      this.queryFiles.addAddress,
      {
        network_key,
        address,
        key_encrypted,
        owner_kind,
        created_at,
      }
    );

    return result;
  }

  async getNode({
    network_key,
    node_id,
  }: {
    network_key: string;
    node_id?: number;
  }): Promise<DbNodeType | null> {
    const result = await this.pgpdb.oneOrNone<DbNodeType>(
      this.queryFiles.getNode,
      {
        network_key,
        node_id,
      }
    );

    return result;
  }

  async getAddress({
    address,
    network_key,
  }: {
    address: string;
    network_key: string;
  }): Promise<DbAddressType | null> {
    const result = await this.pgpdb.oneOrNone<DbAddressType>(
      this.queryFiles.getAddress,
      {
        network_key,
        address,
      }
    );

    return result;
  }

  async runQueryFromFile(
    filePath: string,
    tx?: ITask<Record<string, unknown>>
  ): Promise<void> {
    const queryFile = new QueryFile(filePath, { noWarnings: true });
    const t = tx ?? this.pgpdb;
    await t.none(queryFile);
  }
}
