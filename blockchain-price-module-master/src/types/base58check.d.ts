declare module 'base58check' {
  /**
   * Encodes the given data into a base58check format.
   * @param data - The data to be encoded, either as a string or Buffer.
   * @param prefix - Optional prefix, default is '00'.
   * @param encoding - Optional encoding, default is 'hex'.
   * @returns The base58check-encoded string.
   */
  export function encode(data: Buffer | string, prefix?: string | Buffer, encoding?: BufferEncoding): string;

  /**
   * Decodes a base58check string.
   * @param string - The base58check-encoded string to decode.
   * @param encoding - Optional encoding to convert the decoded data.
   * @returns An object containing the prefix and data as Buffers or strings based on encoding.
   */
  export function decode(string: string, encoding?: BufferEncoding): { prefix: string | Buffer; data: string | Buffer };
}
