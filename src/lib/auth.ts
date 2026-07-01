import { pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'sitka-secret-key-32-chars-long-12345';
// Generate a 32-byte key for AES-256-CBC
const key = Buffer.from(pbkdf2Sync(SECRET_KEY, 'salt', 1000, 32, 'sha256'));

export type SessionPayload = {
  userId: string;
  username: string;
  role: string;
  expires: string;
};

// Encrypt session payload into a cookie value
export function encryptSession(sessionData: SessionPayload): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(sessionData), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt session cookie back into payload
export function decryptSession(sessionStr: string): SessionPayload | null {
  try {
    const [ivHex, encryptedHex] = sessionStr.split(':');
    if (!ivHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const payload = JSON.parse(decrypted) as SessionPayload;
    // Check if session has expired
    if (new Date(payload.expires) < new Date()) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// Verify password against stored PBKDF2 hash
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const verifyHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (e) {
    return false;
  }
}
