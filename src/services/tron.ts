const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;

const TRON_PRO_API_KEY = process.env.TRON_PRO_API_KEY;

const FULL_NODE = process.env.FULL_NODE;
const SOLIDITY_NODE = process.env.SOLIDITY_NODE;
const EVENT_SERVER = process.env.EVENT_SERVER;

const fullNode = new HttpProvider(FULL_NODE);
const solidityNode = new HttpProvider(SOLIDITY_NODE);
const eventServer = new HttpProvider(EVENT_SERVER);

const tronWeb = new TronWeb(fullNode,solidityNode,eventServer);
tronWeb.setHeader({"TRON-PRO-API-KEY": TRON_PRO_API_KEY});

import { Credential } from "../interfaces/credential.interface";

const createWalletTRON = async (mnemonic: string) => {
  const account = await tronWeb.fromMnemonic(mnemonic);
  let privateKey;

  if (account.privateKey.indexOf('0x') === 0) {
      privateKey = account.privateKey.slice(2);
  } else {
      privateKey = account.privateKey;
  }

  const credential: Credential = {
    name: "TRON",
    address: account.address,
    privateKey: privateKey
  };

  return credential;
};

const isAddressTRON = async (address: string) => {
  const is_address: boolean = await tronWeb.isAddress(address);
  return is_address;
};

export { createWalletTRON, isAddressTRON };