import { ethers, Wallet } from "ethers";
import Web3 from "web3";
import { Credential } from "../interfaces/credential.interface";

const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://${ETHEREUM_NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`
  )
);

const NETWORK = process.env.NETWORK;
const ETHERSCAN = process.env.ETHERSCAN;

const createWalletETH = async (mnemonic: string) => {
  const provider = new ethers.EtherscanProvider(ETHERSCAN);
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  const credential: Credential = {
    name: "ETH",
    address: wallet.address,
    privateKey: wallet.privateKey
  };

  return credential;
};

const isAddressETH = async (address: string) => {
  const is_address = await web3.utils.isAddress(address);
  return is_address;
};

export { createWalletETH, isAddressETH };