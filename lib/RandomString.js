import Crypto from 'crypto';

export default function randomString(size = 21) {  
  return Crypto
    .randomBytes(size)
    .toString('hex')
    .slice(0, size)
}
