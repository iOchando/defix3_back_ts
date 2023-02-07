import { ethers, toBigInt, Wallet } from "ethers";
import Web3 from "web3";
import { Credential } from "../interfaces/credential.interface";

import { minAbi } from "../helpers/minabi";

const WEB_BSC = process.env.WEB_BSC

const web3BSC = new Web3(
  new Web3.providers.HttpProvider(
    WEB_BSC || ""
  )
);

const ETHERSCAN = process.env.ETHERSCAN;

const createWalletBNB = async (mnemonic: string) => {
  const provider = new ethers.EtherscanProvider(ETHERSCAN);
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  const credential: Credential = {
    name: "BNB",
    address: wallet.address,
    privateKey: wallet.privateKey
  };

  return credential;
};

const isAddressBNB = async (address: string) => {
  const is_address = await web3BSC.utils.isAddress(address);
  return is_address;
};

const getBalanceBNB = async (address: string) => {
  try {
    let balanceTotal = 0

    let balance = await web3BSC.eth.getBalance(address);

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
    console.error(error);
    return 0
  };
};

const getBalanceTokenBSC = async (address: string, srcContract: string, decimals: number) => {
  try {
    const minABI = minAbi()

    let contract = new web3BSC.eth.Contract(minABI, srcContract);
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

export { createWalletBNB, isAddressBNB, getBalanceBNB, getBalanceTokenBSC };