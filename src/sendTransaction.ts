import axios from 'axios';
import web3 from 'web3';
import { TransactionConfig } from 'web3-core';
import { JapiError, ErrorSerializer } from 'ts-japi';

const PrimitiveErrorSerializer = new ErrorSerializer();

export default async ({
  params,
  pk,
  nodeUrl,
}: {
  params: TransactionConfig;
  pk: string;
  nodeUrl: string;
}): Promise<
  | { status: 'OK'; data: { tx_id: string } }
  | { status: 'ERROR'; errors: Array<JapiError> }
> => {
  try {
    const client = new web3(nodeUrl);
    const signedTransaction = await client.eth.accounts.signTransaction(
      params,
      pk
    );

    const response = await axios({
      url: nodeUrl,
      method: 'POST',
      data: {
        method: 'eth_sendRawTransaction',
        params: [signedTransaction.rawTransaction],
        id: 1,
        jsonrpc: '2.0',
      },
    });

    if (response.data.error) {
      return {
        status: 'ERROR',
        errors: [
          {
            title: 'eth_sendRawTransaction error',
            detail: response.data.error.message,
            meta: { nodeResponse: response.data },
            stack: 'Error',
          },
        ],
      };
    }

    return { status: 'OK', data: { tx_id: response.data.result } };
  } catch (error) {
    console.log('sendTransaction error: ', error.message);
    const errorDocument = PrimitiveErrorSerializer.serialize(error);
    return {
      status: 'ERROR',
      errors: errorDocument.errors,
    };
  }
};
