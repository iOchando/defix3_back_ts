import bitcoin from "bitcoinjs-lib";
import { networks, payments } from "bitcoinjs-lib";
import { mnemonicToSeedSync } from 'bip39';
const WAValidator = require("wallet-address-validator");
import axios from "axios";
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

	return credential;
};

const isAddressBTC = async (address: string) => {
	const is_address: boolean = WAValidator.validate(address, "BTC");
	return is_address;
};

const getBalanceBTC = async (address: string) => {
	try {
		const method = 'get';
		const url = "https://blockchain.info/q/addressbalance/" + address;

		const balance = await axios[method](url,
			{
				headers:
				{
					'Content-Type': 'application/json',
				},
			}).then(async (response) => {
				if (response.data || response.data === 0) {
					const satoshi = response.data;
					const value_satoshi = 100000000;
					const balance = (satoshi / value_satoshi) || 0
					return balance
				};
				const item = await getBalanceBTC_Cypher(address);
				return item;
			}).catch(async (error) => {
				const item = await getBalanceBTC_Cypher(address);
				return item;
			})
		return balance;
	} catch (error) {
		console.error(error);
		const item = await getBalanceBTC_Cypher(address);
		return item;
	}
}

const getBalanceBTC_Cypher = async (address: string) => {
	try {
		const method = 'get';
		const url = 'https://api.blockcypher.com/v1/btc/' + process.env.BLOCKCYPHER + '/addrs/' + address + '/balance?token=' + "efe763283ba84fef88d23412be0c5970";

		const balance = await axios[method](url,
			{
				headers:
				{
					'Content-Type': 'application/json',
				},
			}).then((response) => {
				if (response.data) {
					const satoshi = response.data.balance;
					const value_satoshi = 100000000;
					return (satoshi / value_satoshi) || 0
				};
				return 0
			}).catch((error) => {
				return 0
			});
		return balance;
	} catch (error) {
		console.log(error);
		return 0
	};
};

export { createWalletBTC, isAddressBTC, getBalanceBTC, getBalanceBTC_Cypher };