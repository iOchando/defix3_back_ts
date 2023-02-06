import { KeyPair, keyStores, Near, Account } from "near-api-js";
// const { KeyPair } = nearAPI;
const nearSEED = require("near-seed-phrase");
import { Credential } from "../interfaces/credential.interface";
import { CONFIG } from "../helpers/utils";

const NETWORK = process.env.NETWORK;
const ETHERSCAN = process.env.ETHERSCAN;

const createWalletNEAR = async (mnemonic: string) => {
  const walletSeed = await nearSEED.parseSeedPhrase(mnemonic);
  const keyPair = KeyPair.fromString(walletSeed.secretKey);
  const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString('hex');

  const credential: Credential = {
    name: "NEAR",
    address: implicitAccountId,
    privateKey: walletSeed.secretKey
  };

  return credential;
};

const importWalletNEAR = async (nearId: string, mnemonic: string) => {
  const walletSeed = await nearSEED.parseSeedPhrase(mnemonic);
  const credential: Credential = {
    name: "NEAR",
    address: nearId,
    privateKey: walletSeed.secretKey
  };

  return credential;
};

const getIdNear = async (mnemonic: string) => {
  const walletSeed = await nearSEED.parseSeedPhrase(mnemonic);
  const split = String(walletSeed.publicKey).split(':');
  const id = String(split[1]);
  return id;
};

const isAddressNEAR = async (address: string) => {
  const keyStore = new keyStores.InMemoryKeyStore();
  const near = new Near(CONFIG(keyStore));
  const account = new Account(near.connection, address);
  const is_address = await account.state()
    .then((response) => {
      return true
    }).catch((error) => {
      return false
    })
  return is_address;
};

export { createWalletNEAR, getIdNear, importWalletNEAR, isAddressNEAR };