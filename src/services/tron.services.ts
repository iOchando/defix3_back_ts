const TronWeb = require('tronweb');
const HttpProvider = TronWeb.providers.HttpProvider;

const TRON_PRO_API_KEY = process.env.TRON_PRO_API_KEY;

const FULL_NODE = process.env.FULL_NODE;
const SOLIDITY_NODE = process.env.SOLIDITY_NODE;
const EVENT_SERVER = process.env.EVENT_SERVER;

const fullNode = new HttpProvider(FULL_NODE);
const solidityNode = new HttpProvider(SOLIDITY_NODE);
const eventServer = new HttpProvider(EVENT_SERVER);

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
tronWeb.setHeader({ "TRON-PRO-API-KEY": TRON_PRO_API_KEY });

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

const getBalanceTRON = async (address: string) => {
  try {
    let balanceTotal = 0
    const balance = await tronWeb.trx.getBalance(address);
    if (balance) {
      let value = Math.pow(10, 6);
      balanceTotal = balance / value;
      if (!balanceTotal) {
        balanceTotal = 0;
      };
      return balanceTotal;
    } else {
      return balanceTotal;
    };
  } catch (error) {
    return 0;
  };
};

const getBalanceTokenTRON = async (address: string, srcContract: string, decimals: number) => {
  try {
    tronWeb.setAddress(srcContract);
    const contract = await tronWeb.contract().at(srcContract);

    const balance = await contract.balanceOf(address).call();

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

// const swapTRON = async () => {
//   const walletAddress = 'TU DIRECCIÓN DE BILLETERA TRON';

//   // Contrato que implementa el "swap"
//   const swapContractAddress = 'DIRECCIÓN DEL CONTRATO DE "SWAP"';

//   // Instancia del contrato de "swap"
//   const swapContract = tronWeb.contract(swapContractAddress, [
//     // AQUÍ VAN LOS ABIs (INTERFAZ DE CONTRATO) DEL CONTRATO DE "SWAP"
//   ]);

//   // Ejecuta la función de "swap" del contrato
//   swapContract.swap(tokenIn, tokenOut, walletAddress).send({
//     from: walletAddress,
//     callValue: 0,
//   }).then(console.log)
//     .catch(console.error);
// }

export { createWalletTRON, isAddressTRON, getBalanceTRON, getBalanceTokenTRON };