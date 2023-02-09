import dbConnect from "../config/postgres";
import { getIdNear } from "../services/near.services";
import { Pool } from "pg";
import axios from "axios";

const NETWORK = process.env.NETWORK;

async function saveTransaction(
  fromDefix: string, 
  toDefix: string, coin: string,
  amount: number, 
  fromAddress: string, 
  toAddress: string,
  hash: string, 
  tipo: string
) {
  try {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let date_time = (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
    let dateFech = (year + "-" + month + "-" + date)

    const conexion = await dbConnect()
    const response = await conexion.query(`insert into transactions
      (from_defix, from_address, to_defix, to_address, coin, value, date_time, date_fech ,date_year, date_month, hash, tipo)
      values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`, [fromDefix, fromAddress, toDefix, toAddress, coin, String(amount), String(date_time), String(dateFech), String(year), String(month), hash, tipo])
      .then(() => {
        const transaction = {
          from_defix: fromDefix,
          from_address: fromAddress,
          to_defix: toDefix,
          to_address: toAddress,
          coin: coin,
          value: String(amount),
          date_time: String(date_time),
          date_fech: String(dateFech),
          date_year: String(year),
          date_month: String(month),
          hash: hash,
          tipo: tipo
        }
        return transaction
      }).catch((error) => {
        return false
      })
    return response
  } catch (error) {
    return false
  }
}

async function getAddressUser(defixId: string, blockchain: string) {
  try {
    const conexion = await dbConnect()
    const resultados = await conexion.query("select * \
                                          from addresses where \
                                          defix_id = $1 and name = $2\
                                          ", [defixId, blockchain])

    if (resultados.rows.length > 0) {
      return resultados.rows[0].address || false
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

const validateDefixId = async (defixId: String) => {
  try {
    const conexion: Pool = await dbConnect();
    const resultados = await conexion.query("select * \
                                            from users where \
                                            defix_id = $1\
                                            ", [defixId]);

    if (resultados.rows.length > 0) {
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const validateMnemonicDefix = async (defixId: string, mnemonic: string) => {
  try {
    const conexion: Pool = await dbConnect();
    const response = await conexion.query("select * \
                                          from users where \
                                          defix_id = $1\
                                          ", [defixId]);

    if (response.rows.length > 0) {
      const id = await getIdNear(mnemonic)
      const defixAccount = response.rows[0]
      if (defixAccount.import_id === id) {
        return true
      }
      return false
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const validateEmail = (email: string) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3,4})+$/.test(email)) {
    return true
  } else {
    return false
  }
}

function CONFIG(keyStores: any) {
  switch (NETWORK) {
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        keyStore: keyStores,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org'
      };
    case 'testnet':
      return {
        networkId: 'testnet',
        keyStore: keyStores,
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org'
      };
    default:
      throw new Error(`Unconfigured environment '${NETWORK}'`);
  }
}

function ADDRESS_VAULT(coin: string) {
  switch (coin) {
    case 'BTC':
      return process.env.VAULT_BTC
    case 'NEAR':
      return process.env.VAULT_NEAR
    case 'ETH':
      return process.env.VAULT_ETH
    case 'TRX':
      return process.env.VAULT_TRON
    case 'BNB':
      return process.env.VAULT_BNB
    default:
      throw new Error(`Unconfigured environment '${coin}'`)
  }
}

async function GET_COMISION(coin: string) {
  try {
    const url = process.env.URL_DJANGO + "api/v1/get-comision/" + coin
    const result = axios.get(url)
      .then(function (response) {
        return response.data
      })
      .catch(function (xhr) {
        return false
      });
    return result
  } catch (error) {
    return false
  }
}

const getCryptosFn = async () => {
  try {
    const conexion = await dbConnect();
    const cryptocurrencys = await conexion.query("select * from backend_cryptocurrency");

    const cryptos = []

    for (let cryptocurrency of cryptocurrencys.rows) {
      const tokens = await conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
      cryptocurrency.tokens = tokens.rows
      cryptos.push(cryptocurrency)
    }

    return cryptos
  } catch (error) {
    console.log(error)
    return []
  };
};

export { saveTransaction, getAddressUser, validateDefixId, CONFIG, validateMnemonicDefix, validateEmail, GET_COMISION, ADDRESS_VAULT, getCryptosFn };
