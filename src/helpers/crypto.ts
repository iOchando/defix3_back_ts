import crypto from 'crypto';

const decrypt = (encryption: string) => {
  try {
    const decoded = crypto.privateDecrypt(
      { key: process.env.PRIVATE_KEY as string, passphrase: process.env.PASSWORD_DB, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(encryption, 'hex')
    ).toString();
    return decoded
  } catch (error) {
    return false
  }
}

const encrypt = (text: string) => {
  try {
    const encrypted = crypto.publicEncrypt(
      { key: process.env.PUBLIC_KEY as string, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(text)
    );
    return encrypted.toString('hex')
  } catch (error) {
    console.log(error)
    return false
  }
}

// import fs from 'fs';

// Generación de claves
// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//   modulusLength: 2048,
//   publicKeyEncoding: {
//     type: 'spki',
//     format: 'pem'
//   },
//   privateKeyEncoding: {
//     type: 'pkcs8',
//     format: 'pem',
//     cipher: 'aes-256-cbc',
//     passphrase: process.env.PASSWORD_DB
//   }
// });
// fs.writeFileSync('clave_publica.pem', publicKey);
// fs.writeFileSync('clave_privada.pem', privateKey);

export { decrypt, encrypt }