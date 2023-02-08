import { Request, Response } from "express";
import dbConnect from "../config/postgres";
import { validateDefixId, validateEmail } from "../helpers/utils";
import { encrypt, decrypt } from "../helpers/crypto";
import { generateMnemonic } from 'bip39';

import { createWalletBTC, isAddressBTC } from "../services/btc.services";
import { createWalletETH, isAddressETH } from "../services/eth.services";
import { createWalletNEAR, getIdNear, importWalletNEAR, isAddressNEAR } from "../services/near.services";
import { createWalletTRON, isAddressTRON } from "../services/tron.services";
import { createWalletBNB, isAddressBNB } from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";

import { minAbi } from "../helpers/minabi";