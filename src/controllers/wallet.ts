import nearAPI from "near-api-js";
import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId } from "../helpers/utils";

const generateMnemonic = async (req: Request, res: Response) => {
    try {
        const { defixId } = req.body;

        if (!defixId || !defixId.includes(".defix3")) res.status(400).send();
        
        const resp: boolean = await validateDefixId(defixId.toLowerCase());

        res.send(resp);
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send({ err });
    }
};

const createWallet = async (req: Request, res: Response) => {
    try {
        const { defixId, mnemonic, email } = req.body;

        if (!defixId || !defixId.includes(".defix3") || !mnemonic) res.status(400).send();

        let defixID = defixId.split(" ").join("")
        
        const exists: boolean = await validateDefixId(defixID.toLowerCase());
    
        if (!exists) {
            //let mnemonic = bip39.generateMnemonic()

            var wallet = {
                defixId: defixID,
                mnemonic: mnemonic
            }
            wallet.btc_credentials = await createWalletBTC(mnemonic)

            // const save = await saveUser(defixID.toLowerCase(), wallet.btc_credentials, wallet.eth_credentials, wallet.near_credentials, wallet.tron_credentials, wallet.bnb_credentials)
        
            // if (save) {
            //     if(email !== null) {
            //         EnviarPhraseCorreo(mnemonic, defixID.toLowerCase(), email)
            //     }
            //     res.json(wallet)
            // } else {
            //     res.status(204).json()
            // }
        }
        res.status(405).send()
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send({ err });
    }
  };

export { generateMnemonic, createWallet }

/*
const createWallet = async (req, res) => {
    try {
        const { defixId, mnemonic, email } = req.body
        const defixID = defixId.split(" ").join("")
        const response = await validateDefixId(defixId.toLowerCase())

        if (response === false) {
            //let mnemonic = bip39.generateMnemonic()

            var wallet = {}
            wallet.defixId = defixID.toLowerCase()
            wallet.mnemonic = mnemonic
            wallet.btc_credentials = await createWalletBTC(mnemonic)
            wallet.eth_credentials = await createWalletETH(mnemonic)
            wallet.near_credentials = await createWalletNEAR(mnemonic)
            wallet.dai_credentials = wallet.eth_credentials
            wallet.usdt_credentials = wallet.eth_credentials
            wallet.usdc_credentials = wallet.eth_credentials
            wallet.tron_credentials = await createWalletTRON(mnemonic)
            wallet.bnb_credentials = wallet.eth_credentials

            const save = await saveUser(defixID.toLowerCase(), wallet.btc_credentials, wallet.eth_credentials, wallet.near_credentials, wallet.tron_credentials, wallet.bnb_credentials)
        
            if (save) {
                if(email !== null) {
                    EnviarPhraseCorreo(mnemonic, defixID.toLowerCase(), email)
                }
                res.json(wallet)
            } else {
                res.status(204).json()
            }
        } else {
            res.status(204).json()
        }
    } catch (error) {
        console.log(error)
        res.status(400).json()
    }
}
*/