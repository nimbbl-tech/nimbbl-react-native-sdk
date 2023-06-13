import { Buffer } from 'buffer';

export const decryptResponse = (response: string) =>
  Buffer.from(response || '', 'base64').toString('utf-8') || '';
