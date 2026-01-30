// Device fingerprinting for vote tracking
// Uses localStorage-persisted UUID for simplicity

const FINGERPRINT_KEY = 'fastvote_fingerprint';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getFingerprint(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);

  if (!fingerprint) {
    fingerprint = generateUUID();
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  }

  return fingerprint;
}
