/**
 * Simple browser fingerprinting for anonymous user identification
 * Combines stable browser characteristics to create a unique identifier
 */

// Simple hash function for generating fingerprint
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Generate a browser fingerprint based on stable characteristics
 */
export function generateBrowserFingerprint(): string {
  try {
    const components = [
      screen.width.toString(),
      screen.height.toString(),
      navigator.language || 'unknown',
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown',
      navigator.platform || 'unknown',
      navigator.hardwareConcurrency?.toString() || '0',
      screen.colorDepth?.toString() || '24'
    ];
    
    const fingerprint = simpleHash(components.join('|'));
    return `fp_${fingerprint}`;
  } catch (error) {
    console.warn('Error generating fingerprint:', error);
    // Fallback to random ID if fingerprinting fails
    return `fp_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Get or create a persistent fingerprint for this browser
 */
export function getPersistentFingerprint(): string {
  const STORAGE_KEY = 'browser_fingerprint';
  
  try {
    // Try to get existing fingerprint from localStorage
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      return existing;
    }
    
    // Generate new fingerprint
    const fingerprint = generateBrowserFingerprint();
    localStorage.setItem(STORAGE_KEY, fingerprint);
    return fingerprint;
  } catch (error) {
    console.warn('localStorage not available, using session fingerprint:', error);
    // Fallback if localStorage is not available
    return generateBrowserFingerprint();
  }
}
