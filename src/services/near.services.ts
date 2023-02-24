import { KeyPair, keyStores, Near, Account, utils } from "near-api-js";
import axios from 'axios';
const nearSEED = require("near-seed-phrase");
import { Credential } from "../interfaces/credential.interface";
import { CONFIG, GET_COMISION, ADDRESS_VAULT } from "../helpers/utils";
import { BufferN } from "bitcoinjs-lib/src/types";
import BN from 'bn.js'
import dbConnect from "../config/postgres";
import ref from '@ref-finance/ref-sdk'
import { ftGetTokensMetadata, fetchAllPools, estimateSwap, instantSwap } from '@ref-finance/ref-sdk'

const NETWORK = process.env.NETWORK || 'testnet';
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

const getBalanceNEAR = async (address: string) => {
  try {
    const response: boolean = await validateNearId(address);

    let balanceTotal = 0

    if (response) {
      const keyStore = new keyStores.InMemoryKeyStore();
      const near = new Near(CONFIG(keyStore));

      const account = new Account(near.connection, address);

      const balanceAccount = await account.state();
      const valueStorage = Math.pow(10, 19);
      const valueYocto = Math.pow(10, 24);
      const storage = (balanceAccount.storage_usage * valueStorage) / valueYocto;
      balanceTotal = (Number(balanceAccount.amount) / valueYocto) - storage - 0.05
      if (balanceTotal === null || balanceTotal < 0) {
        balanceTotal = 0;
      };
      return balanceTotal;
    } else {
      return balanceTotal;
    };
  } catch (error) {
    return 0
  };
};

async function transactionNEAR(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  coin: string,
  amount: number,
) {
  try {
    const balance_user = await getBalanceNEAR(fromAddress);

    const keyStore = new keyStores.InMemoryKeyStore();

    const keyPair = KeyPair.fromString(privateKey);
    keyStore.setKey(NETWORK, fromAddress, keyPair);

    const near = new Near(CONFIG(keyStore));

    const account = new Account(near.connection, fromAddress);

    const resp_comision = await GET_COMISION(coin);
    const vault_address = await ADDRESS_VAULT(coin);

    const nearPrice = await axios.get('https://nearblocks.io/api/near-price');

    const for_vault = resp_comision.transfer / nearPrice.data.usd;

    const amountInYocto = utils.format.parseNearAmount(String(amount));

    const for_vaultYocto = utils.format.parseNearAmount(String(for_vault));

    if (balance_user < amount + for_vault) return false

    if (!amountInYocto) return false

    const response = await account.sendMoney(toAddress, new BN(amountInYocto));

    if (for_vaultYocto !== '0' && vault_address && for_vaultYocto) {
      await account.sendMoney(vault_address, new BN(for_vaultYocto));
    }

    if (!response.transaction.hash) return false

    return response.transaction.hash as string
  } catch (error) {
    console.log(error);
    return false;
  }
}

const swapPreviewNEAR = async (fromCoin: string, toCoin: string, amount: number, blockchain: string, address: string) => {
  try {
    const fromToken: any = await getTokenContractSwap(fromCoin, blockchain)
    const toToken: any = await getTokenContractSwap(toCoin, blockchain)

    const tokenIn = fromToken.contract
    const tokenOut = toToken.contract

    console.log(tokenIn, tokenOut)

    const tokensMetadata = await ftGetTokensMetadata([
      tokenIn,
      tokenOut,
    ]);

    const simplePools = ((await fetchAllPools()).simplePools).filter((pool) => { return pool.tokenIds[0] === tokenIn && pool.tokenIds[1] === tokenOut });

    const swapAlls = await estimateSwap({
      tokenIn: tokensMetadata[tokenIn],
      tokenOut: tokensMetadata[tokenOut],
      amountIn: String(amount),
      simplePools: simplePools,
      options: {enableSmartRouting: true}
    });

    const transactionsRef = await instantSwap({
      tokenIn: tokensMetadata[tokenIn],
      tokenOut: tokensMetadata[tokenOut],
      amountIn: String(amount),
      swapTodos: swapAlls,
      slippageTolerance: 0.01,
      AccountId: address
    });
    
    return transactionsRef
  } catch (error) {
    console.log(error)
    return false
  }
}

const getTokenContractSwap = async (token: string, blockchain: string) => {
  try {
    const conexion = await dbConnect()
    const response = await conexion.query("SELECT *\
                                          FROM backend_token a\
                                          inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
                                          where a.coin = $1 and b.coin = $2",
      [token, blockchain])

    if (response.rows.length === 0) {
      if (token === "NEAR") {
        console.log("ENTRO")
        return {
          decimals: 24,
          contract: "wrap.testnet"
        }
      }
      return false
    }
    return response.rows[0]
  } catch (error) {
    return false
  }
}

const validateNearId = async (address: string) => {
  try {
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = new Near(CONFIG(keyStore));
    const account = new Account(near.connection, address);
    const response = await account.state()
      .then((response) => {
        return true;
      }).catch((error) => {
        return false;
      });
    return response;
  } catch (error) {
    return false;
  };
};

export { swapPreviewNEAR, transactionNEAR, createWalletNEAR, getIdNear, importWalletNEAR, isAddressNEAR, getBalanceNEAR };

