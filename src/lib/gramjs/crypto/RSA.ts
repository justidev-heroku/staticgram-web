import { concat } from '../../../util/encoding/buffer';

import {
  generateRandomBytes,
  modExp,
  readBigIntFromBuffer,
  readBufferFromBigInt,
  sha1,
} from '../Helpers';

export const SERVER_KEYS = [
  // StaticGram (gramsrv) server key, fingerprint 0x857119f27ae9c9fc
  {
    fingerprint: BigInt('-8831248865061910020'),
    n: BigInt(
      '2090009985540995487169765572147154317313101985084049474867660535557397779015356330674903983960539927'
      + '5117791229819701218776628033918927383956609260867518725027573315189351961212459395835772930462865592'
      + '0739068465217149932181508139002345905603168232347701297822957636060523877777164705277815239980604188'
      + '9811681144988031894247775524618753561274518352256106165208496424632927564090062073824469999741326730'
      + '7194562488397899144829057826692086490532929923077790662791609338644717796063331280088081957923819773'
      + '7953413456831701534213866632085614879314007827383646023944024011048652379640678653965997849645919176'
      + '75078516798473643',
    ),
    e: 65537,
  },
].reduce((acc, { fingerprint, ...keyInfo }) => {
  acc.set(fingerprint, keyInfo);
  return acc;
}, new Map<bigint, { n: bigint; e: number }>());

/**
 * Encrypts the given data known the fingerprint to be used
 * in the way Telegram requires us to do so (sha1(data) + data + padding)

 * @param fingerprint the fingerprint of the RSA key.
 * @param data the data to be encrypted.
 * @returns the cipher text, or undefined if no key matching this fingerprint is found.
 */
export async function encrypt(fingerprint: bigint, data: Uint8Array): Promise<Uint8Array | undefined> {
  const key = SERVER_KEYS.get(fingerprint);
  if (!key) {
    return undefined;
  }

  // len(sha1.digest) is always 20, so we're left with 255 - 20 - x padding
  const rand = generateRandomBytes(235 - data.length);

  const toEncrypt = concat(await sha1(data), data, rand);

  // rsa module rsa.encrypt adds 11 bits for padding which we don't want
  // rsa module uses rsa.transform.bytes2int(to_encrypt), easier way:
  const payload = readBigIntFromBuffer(toEncrypt, false);
  const encrypted = modExp(payload, BigInt(key.e), key.n);
  // rsa module uses transform.int2bytes(encrypted, keylength), easier:
  return readBufferFromBigInt(encrypted, 256, false);
}
