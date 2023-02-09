// eslint-disable-next-line @typescript-eslint/no-var-requires
import { ethers, InterfaceAbi, Wallet } from "ethers";
import Web3 from "web3";
import { AbiItem } from 'web3-utils';
import { Credential } from "../interfaces/credential.interface";
import axios from "axios";
import { ADDRESS_VAULT, GET_COMISION } from "../helpers/utils";

import abi from '../helpers/abi.json';


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
    let contract = new web3.eth.Contract(abi as AbiItem[], srcContract);

    const balance = await contract.methods.balanceOf(address).call()

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
    console.log(error)
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

    const response = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6')
    let wei = response.data.result.SafeGasPrice
    let fee = Number(web3.utils.fromWei(String(21000 * wei), 'gwei'))

    const resp_comision = await GET_COMISION(coin)
    const vault_address = await ADDRESS_VAULT(coin)

    const comision = resp_comision.transfer / 100

    let amount_vault = Number((fee * comision).toFixed(18))

    console.log(amount_vault, vault_address)

    if (amount_vault !== 0 && vault_address) {
      await payCommissionETH(fromAddress, privateKey, vault_address, amount_vault)
    }

    if (!transactionHash.transactionHash) return false

    return transactionHash.transactionHash as string;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function transactionTokenETH(fromAddress: string, privateKey: string, toAddress: string, amount: number, srcToken: any) {
  try {
    const balance = await getBalanceTokenETH(fromAddress, srcToken.contract, srcToken.decimals);
    if (balance && balance < amount) {
      console.log('Error: No tienes suficientes fondos para realizar la transferencia');
      return false;
    }

    let provider = ethers.getDefaultProvider(String(ETHERSCAN))

    const minABI: InterfaceAbi = abi

    const wallet = new ethers.Wallet(privateKey)
    const signer = wallet.connect(provider)

    const contract = new ethers.Contract(srcToken.contract, minABI, signer);
    let value = Math.pow(10, srcToken.decimals)
    let srcAmount = amount * value

    const tx = await contract.transfer(toAddress, String(srcAmount));

    const response = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6')
    let wei = response.data.result.SafeGasPrice
    let fee = Number(web3.utils.fromWei(String(55000 * wei), 'gwei'))

    const resp_comision = await GET_COMISION(srcToken.coin)
    const vault_address = await ADDRESS_VAULT(srcToken.blockchain)

    const comision = resp_comision.transfer / 100

    let amount_vault = Number((fee * comision).toFixed(18))

    if (amount_vault !== 0 && vault_address) {
      await payCommissionETH(fromAddress, privateKey, vault_address, amount_vault)
    }

    if (tx.hash) {
      return tx.hash as string
    }
    return false
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function payCommissionETH(fromAddress: string, privateKey: string, toAddress: string, amount: number) {
  try {
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

    await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  } catch (error) {
    return false
  }
}



export { createWalletETH, isAddressETH, getBalanceETH, getBalanceTokenETH, transactionETH, transactionTokenETH };