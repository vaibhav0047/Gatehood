export function generateInviteCode(unit: string): string {
  const cleanUnit = unit.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    suffix += chars[randomIndex];
  }
  return `${cleanUnit}-${suffix}`;
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}
