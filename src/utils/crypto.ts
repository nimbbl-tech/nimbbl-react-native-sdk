import AES from 'crypto-js/aes';
import { Buffer } from 'buffer';

const password = 'BlisteringBarnacles@3214!QAZ@WSX£EDC$RFV%TGB';

export const encryptBody = (data: Object) =>
  AES.encrypt(JSON.stringify(data), password).toString();

export const decryptResponse = (response: string) =>
  Buffer.from(response || '', 'base64').toString('utf-8') || '';
