// Edge-compatible password hashing — uses WebCrypto (crypto.subtle), no bcryptjs.
// Works in Cloudflare Workers, Node.js, and browsers.

const ITERATIONS = 100_000;
const HASH_ALG = "SHA-256";

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: HASH_ALG },
    keyMaterial,
    256
  );
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltB64 = btoa(String.fromCharCode(...salt));
  return `pbkdf2$${saltB64}$${hashB64}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  // Backwards-compat: existing bcrypt hashes ($2b$...) still work.
  // On next login the hash will be regenerated in PBKDF2 format.
  if (stored.startsWith("$2")) {
    const { compare } = await import("bcryptjs");
    return compare(password, stored);
  }

  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const [, saltB64, hashB64] = parts;

  const enc = new TextEncoder();
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: HASH_ALG },
    keyMaterial,
    256
  );
  const computed = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return computed === hashB64;
}
