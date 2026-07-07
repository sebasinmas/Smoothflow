export interface FieldCrypto {
  encrypt(value: string): string;
  decrypt(payload: string): string;
}
