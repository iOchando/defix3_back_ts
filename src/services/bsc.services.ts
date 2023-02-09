import { ethers, toBigInt, Wallet, InterfaceAbi } from "ethers";
import Web3 from "web3";
import { Credential } from "../interfaces/credential.interface";
import { AbiItem } from 'web3-utils';
import axios from "axios";
import { ADDRESS_VAULT, GET_COMISION } from "../helpers/utils";

import abi from '../helpers/abi.json';

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
    let contract = new web3BSC.eth.Contract(abi as AbiItem[], srcContract);
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

async function transactionBNB(fromAddress: string, privateKey: string, toAddress: string, coin: string, amount: number) {
  try {
    const balance = await getBalanceBNB(fromAddress);
    if (balance < amount) {
      console.log('Error: No tienes suficientes fondos para realizar la transferencia');
      return false;
    }

    const gasPrice = await web3BSC.eth.getGasPrice();
    const gasLimit = 21000;
    const nonce = await web3BSC.eth.getTransactionCount(fromAddress);

    const rawTransaction = {
      from: fromAddress,
      to: toAddress,
      value: web3BSC.utils.toHex(web3BSC.utils.toWei(amount.toString(), 'ether')),
      gasPrice: web3BSC.utils.toHex(gasPrice),
      gasLimit: web3BSC.utils.toHex(gasLimit),
      nonce: nonce
    };

    const signedTransaction = await web3BSC.eth.accounts.signTransaction(rawTransaction, privateKey);

    if (!signedTransaction.rawTransaction) return false

    const transactionHash = await web3BSC.eth.sendSignedTransaction(signedTransaction.rawTransaction);

    const response = await axios.get('https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=3SU1MAWAPX8X39UD6U8JBGTQ5C67EVVRSM')
    let wei = response.data.result.SafeGasPrice
    let fee = Number(web3BSC.utils.fromWei(String(21000 * wei), 'gwei'))

    const resp_comision = await GET_COMISION(coin)
    const vault_address = await ADDRESS_VAULT(coin)

    const comision = resp_comision.transfer / 100

    let amount_vault = Number((fee * comision).toFixed(18))

    if (amount_vault !== 0 && vault_address) {
      await payCommissionBNB(fromAddress, privateKey, vault_address, amount_vault)
    }

    if (!transactionHash.transactionHash) return false

    return transactionHash.transactionHash as string;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function transactionTokenBNB(fromAddress: string, privateKey: string, toAddress: string, amount: number, srcToken: any) {
  try {
    const balance = await getBalanceTokenBSC(fromAddress, srcToken.contract, srcToken.decimals);
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
    let fee = Number(web3BSC.utils.fromWei(String(55000 * wei), 'gwei'))

    const resp_comision = await GET_COMISION(srcToken.coin)
    const vault_address = await ADDRESS_VAULT(srcToken.blockchain)

    const comision = resp_comision.transfer / 100

    let amount_vault = Number((fee * comision).toFixed(18))

    if (amount_vault !== 0 && vault_address) {
      await payCommissionBNB(fromAddress, privateKey, vault_address, amount_vault)
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

async function payCommissionBNB(fromAddress: string, privateKey: string, toAddress: string, amount: number) {
  try {
    const gasPrice = await web3BSC.eth.getGasPrice();
    const gasLimit = 21000;
    const nonce = await web3BSC.eth.getTransactionCount(fromAddress);

    const rawTransaction = {
      from: fromAddress,
      to: toAddress,
      value: web3BSC.utils.toHex(web3BSC.utils.toWei(amount.toString(), 'ether')),
      gasPrice: web3BSC.utils.toHex(gasPrice),
      gasLimit: web3BSC.utils.toHex(gasLimit),
      nonce: nonce
    };

    const signedTransaction = await web3BSC.eth.accounts.signTransaction(rawTransaction, privateKey);

    if (!signedTransaction.rawTransaction) return false

    await web3BSC.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  } catch (error) {
    return false
  }
}

export { createWalletBNB, isAddressBNB, getBalanceBNB, getBalanceTokenBSC, transactionBNB, transactionTokenBNB };