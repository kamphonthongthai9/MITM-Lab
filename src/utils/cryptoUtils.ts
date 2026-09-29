/**
 * Cryptographic and simulation helper utilities
 */

export function modExp(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

export function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i).toString(16).padStart(2, '0');
    hex += code + (i % 2 === 1 ? ' ' : '');
  }
  return hex.trim().toUpperCase();
}

export interface HexDumpRow {
  offset: string;
  hexBytes: string;
  ascii: string;
}

/**
 * Produces canonical canonical 16-byte-per-line hexdump (like xxd / hexdump -C)
 */
export function generateDetailedHexDump(input: string): HexDumpRow[] {
  const rows: HexDumpRow[] = [];
  const bytes = new TextEncoder().encode(input);
  const total = bytes.length;

  for (let i = 0; i < total; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const offset = i.toString(16).padStart(8, '0');

    const hexParts1: string[] = [];
    const hexParts2: string[] = [];
    let ascii = '';

    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        const b = chunk[j];
        const hex = b.toString(16).padStart(2, '0').toUpperCase();
        if (j < 8) {
          hexParts1.push(hex);
        } else {
          hexParts2.push(hex);
        }
        // Printable ASCII check
        ascii += (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.';
      } else {
        if (j < 8) {
          hexParts1.push('  ');
        } else {
          hexParts2.push('  ');
        }
        ascii += ' ';
      }
    }

    const hexBytes = `${hexParts1.join(' ')}  ${hexParts2.join(' ')}`;
    rows.push({ offset, hexBytes, ascii });
  }

  return rows;
}

/**
 * Builds realistic full HTTP wire transmission string
 */
export function buildFullHttpWireFrame(
  method: string,
  path: string,
  headers: Record<string, string>,
  body: string
): string {
  let raw = `${method} ${path} HTTP/1.1\r\n`;
  for (const [k, v] of Object.entries(headers)) {
    raw += `${k}: ${v}\r\n`;
  }
  raw += `Content-Length: ${new TextEncoder().encode(body).length}\r\n`;
  raw += `Connection: keep-alive\r\n\r\n`;
  raw += body;
  return raw;
}

export function simulateCiphertext(plaintext: string): { ciphertext: string; tag: string; iv: string } {
  // Deterministic mock TLS 1.3 AES-256-GCM representation for visualization
  let hash = 0;
  for (let i = 0; i < plaintext.length; i++) {
    hash = (hash << 5) - hash + plaintext.charCodeAt(i);
    hash |= 0;
  }
  const hexBase = Math.abs(hash).toString(16).padStart(8, '0');
  const iv = '7A9F3C18E290B541';
  const tag = `AEAD_${hexBase.slice(0, 4).toUpperCase()}_TAG`;
  
  let cipherHex = '';
  for (let i = 0; i < plaintext.length; i++) {
    const byte = (plaintext.charCodeAt(i) ^ (hash & 0xff) ^ (i * 7)) & 0xff;
    cipherHex += byte.toString(16).padStart(2, '0');
  }
  return {
    ciphertext: cipherHex.toUpperCase(),
    tag,
    iv,
  };
}

export interface PresetPayload {
  name: string;
  category: string;
  description: string;
  source: 'Alice' | 'Eve' | 'Bob';
  destination: 'Alice' | 'Eve' | 'Bob';
  content: string;
  tamperedContent: string;
  headers: Record<string, string>;
}

export const PRESET_PAYLOADS: PresetPayload[] = [
  {
    name: 'Wire Transfer Authorization',
    category: 'Banking / Financial',
    description: 'Alice instructs server to transfer $1,500 to Bob',
    source: 'Alice',
    destination: 'Bob',
    content: JSON.stringify({
      action: 'WIRE_TRANSFER',
      from_account: 'ACC-88219-ALICE',
      to_account: 'ACC-44910-BOB',
      amount_usd: 1500.00,
      memo: 'Invoice #492 Payment',
      auth_token: 'Bearer tok_live_948f21e0b'
    }, null, 2),
    tamperedContent: JSON.stringify({
      action: 'WIRE_TRANSFER',
      from_account: 'ACC-88219-ALICE',
      to_account: 'ACC-99999-EVE-OFFSHORE',
      amount_usd: 45000.00,
      memo: 'Invoice #492 Payment',
      auth_token: 'Bearer tok_live_948f21e0b'
    }, null, 2),
    headers: {
      'Host': 'api.securebank.com',
      'User-Agent': 'Mozilla/5.0 (Client-Alice/v2)',
      'Content-Type': 'application/json',
      'X-Transaction-ID': 'tx_78ab41c9'
    }
  },
  {
    name: 'Session Cookie / Auth Login',
    category: 'Identity & Access',
    description: 'Alice submits account credentials to corporate portal',
    source: 'Alice',
    destination: 'Bob',
    content: JSON.stringify({
      username: 'alice.chen@enterprise.io',
      password: 'Super$ecureKey_2026!#',
      mfa_token: '891042',
      remember_me: true
    }, null, 2),
    tamperedContent: JSON.stringify({
      username: 'eve.infiltrator@malicious.org',
      password: 'hijacked_token_active',
      mfa_token: '000000',
      role: 'ADMINISTRATOR'
    }, null, 2),
    headers: {
      'Host': 'sso.enterprise.io',
      'Content-Type': 'application/json',
      'Cookie': 'JSESSIONID=a98ef72bc401; role=standard_user'
    }
  },
  {
    name: 'Firmware Update Download',
    category: 'IoT / Critical Infrastructure',
    description: 'Device requests latest authenticated firmware payload',
    source: 'Alice',
    destination: 'Bob',
    content: JSON.stringify({
      request: 'GET_FIRMWARE',
      device_id: 'ROUTER-X89',
      current_version: 'v2.1.0',
      hash_expected: 'sha256:4a8b9f...e1'
    }, null, 2),
    tamperedContent: JSON.stringify({
      request: 'FLASH_BACKDOOR',
      device_id: 'ROUTER-X89',
      trojan_source: 'http://192.168.1.137/malware.bin',
      hash_expected: 'sha256:000000...00'
    }, null, 2),
    headers: {
      'Host': 'firmware.iot-vendor.net',
      'Accept': 'application/octet-stream'
    }
  }
];
