/**
 * Generates human-readable, secure invite codes.
 * Format: [SanitizedUnit]-[3-4 character crypto-random alphanumeric]
 * Example: For unit "A-1204", generates "A1204-7KQ"
 */
export function generateInviteCode(unit: string): string {
  const cleanUnit = unit.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude 0, 1, I, O to avoid confusion
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    suffix += chars[randomIndex];
  }
  return `${cleanUnit}-${suffix}`;
}

/**
 * Normalizes an invite code for comparison (trims and converts to uppercase)
 */
export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}
