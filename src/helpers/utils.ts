import dbConnect from "../config/postgres";
import { Pool } from "pg";

const NETWORK = process.env.NETWORK;

const validateDefixId = async (defixId: String) => {
    try {
        const conexion: Pool = await dbConnect();
        const resultados = await conexion.query("select * \
                                            from users where \
                                            defix_id = $1\
                                            ", [defixId]);
  
        if(resultados.rows.length > 0) {
            return true;
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
};

function CONFIG (keyStores: any) {
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

export { validateDefixId, CONFIG };
