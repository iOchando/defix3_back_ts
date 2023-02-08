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

async function transactionETH(fromAddress: string, privateKey: string, toAddress: string, coin: string, amount: number) {
  try {
    const balance = await getBalanceETH(fromAddress);
    if (balance < amount) {
      console.log('Error: No tienes suficientes fondos para realizar la transferencia');
      return false;
    }
    
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 21000;
    const nonce = await web3.eth.getTransactionCount(fromAddress);
    
    const rawTransaction = {
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether')),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
      nonce: nonce
    };
    
    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);

    if (!signedTransaction.rawTransaction) return false 

    const transactionHash = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

    if (!transactionHash.transactionHash) return false 
    
    return transactionHash.transactionHash as string;
  } catch (error) {
    console.error(error);
    return false;
  }
}



export { createWalletETH, isAddressETH, getBalanceETH, getBalanceTokenETH, transactionETH };