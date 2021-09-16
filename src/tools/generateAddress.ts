import web3 from 'web3';

export default ({
  entropy,
}: {
  entropy?: string;
}): { address: string; privateKey: string } => {
  const client = new web3();

  const account = client.eth.accounts.create(entropy);

  return { address: account.address, privateKey: account.privateKey };
};
