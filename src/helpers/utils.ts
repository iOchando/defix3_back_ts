import dbConnect from "../config/postgres";
import { getIdNear } from "../services/near.services";
import { Pool } from "pg";
import axios from "axios";

const NETWORK = process.env.NETWORK;

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

function ADDRESS_VAULT (coin: string) {
  switch (coin) {
    case 'BTC':
      return process.env.VAULT_BTC
    case 'NEAR':
      return process.env.VAULT_NEAR
    case 'ETH':
      return process.env.VAULT_ETH
    case 'TRON':
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

export { validateDefixId, CONFIG, validateMnemonicDefix, validateEmail, GET_COMISION, ADDRESS_VAULT, getCryptosFn };
