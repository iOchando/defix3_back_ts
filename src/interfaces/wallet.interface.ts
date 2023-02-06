import { Credential } from "../interfaces/credential.interface";

export interface Wallet {
  defixId: string;
  mnemonic: string;
  credentials: Array<Credential>;
}