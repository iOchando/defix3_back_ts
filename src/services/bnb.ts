import { ethers, toBigInt, Wallet } from "ethers";
import Web3 from "web3";
import { Credential } from "../interfaces/credential.interface";

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
      const item = {coin: "BNB", balance: 0};

      let balance = await web3BSC.eth.getBalance(address);
     
      if (balance) {
          let value = Math.pow(10, 18);
          item.balance = Number(balance) / value;
          if (item.balance === null) {
              item.balance = 0;
          };
          return item;
      } else {
          item.balance = 0;
          return item;
      }        
  } catch (error) {
      console.error(error);
  };
};

export { createWalletBNB, isAddressBNB, getBalanceBNB };