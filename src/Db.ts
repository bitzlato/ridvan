import path from 'path';
import { IDatabase, QueryFile } from 'pg-promise';
import { DbAddressType, DbNodeType } from './types';

const QUERY_NAMES: Array<string> = ['getAddress', 'getNode'];

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

  async getAddress({
    address,
  }: {
    address: string;
  }): Promise<DbAddressType | null> {
    const result = await this.pgpdb.oneOrNone<DbAddressType>(
      this.queryFiles.getAddress,
      {
        address,
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
}
