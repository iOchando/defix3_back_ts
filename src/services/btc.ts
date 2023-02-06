import bitcoin from "bitcoinjs-lib";
import { networks, payments } from "bitcoinjs-lib";
import { mnemonicToSeedSync } from 'bip39';
const WAValidator = require("wallet-address-validator")

import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
const bip32 = BIP32Factory(ecc);

import { Credential } from "../interfaces/credential.interface";

const NETWORK = process.env.NETWORK;

const createWalletBTC = async (mnemonic: string) => {
	// try {
	let network;
	let path;
	if (NETWORK === "mainnet") {
		network = networks.bitcoin; //use networks.testnet networks.bitcoin for testnet
		path = `m/49'/0'/0'/0`; // Use m/49'/1'/0'/0 for testnet mainnet `m/49'/0'/0'/0
	} else {
		network = networks.testnet;
		path = `m/49'/1/0'/0`;
	}
	
	const seed = mnemonicToSeedSync(mnemonic);

	const root: BIP32Interface = bip32.fromSeed(seed, network);

	const account = root.derivePath(path);

	const node = account.derive(0).derive(0);

	const btcAddress = payments.p2pkh({
		pubkey: node.publicKey,
		network: network,
	}).address;

	const credential: Credential = {
		name: "BTC",
		address: btcAddress || "",
		privateKey: node.toWIF()
	};

	return credential
};

const isAddressBTC = async (address: string) => {
  const is_address: boolean = WAValidator.validate(address, "BTC")
  return is_address;
};

export { createWalletBTC, isAddressBTC }