import axios from 'axios';
import web3 from 'web3';
import { TransactionConfig } from 'web3-core';

export default async ({
  params,
  pk,
  nodeUrl,
}: {
  params: TransactionConfig;
  pk: string;
  nodeUrl: string;
}): Promise<
  { status: 'OK'; tx_id: string } | { status: 'ERROR'; message: string }
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
        message: `${response.data.error.message}`,
      };
    }

    return { status: 'OK', tx_id: response.data.result };
  } catch (error) {
    console.log('sendTransaction error: ', error.message);
    return {
      status: 'ERROR',
      message: error.message,
    };
  }
};
