import { ethers, Wallet } from "ethers";
import Web3 from "web3";
import { Credential } from "../interfaces/credential.interface";
import { minAbi } from "../helpers/minabi";

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

const getBalanceETH = async (address: string) => {
  try {
    const item = { coin: "ETH", balance: 0 };
    let balance = await web3.eth.getBalance(address);
    let balanceTotal = 0

    if (balance) {
      let value = Math.pow(10, 18);
      balanceTotal = Number(balance) / value;
      if (!balanceTotal) {
        balanceTotal = 0;
      };
      return balanceTotal;
    } else {
      return balanceTotal;
    }
  } catch (error) {
    return 0
  }
}

const getBalanceTokenETH = async (address: string, srcContract: string, decimals: number) => {
  try {
    const minABI = minAbi()

    let contract = new web3.eth.Contract(minABI, srcContract);
    const balance = await contract.methods.balanceOf(address).call();

    let balanceTotal = 0

    if (balance) {
      let value = Math.pow(10, decimals)
      balanceTotal = balance / value
      if (!balanceTotal) {
        balanceTotal = 0
      }
      return balanceTotal
    } else {
      return balanceTotal
    }
  } catch (error) {
    return 0
  }
}

export { createWalletETH, isAddressETH, getBalanceETH, getBalanceTokenETH };