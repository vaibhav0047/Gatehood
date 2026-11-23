/**
 * Calculates remaining days until possession.
 */
export function calculateDaysToPossession(targetDateStr: string): number {
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Returns a human-friendly relative time string (e.g. "Just now", "5m ago", "2h ago", "3d ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formats full date with time (e.g. "Nov 23, 2026 at 4:30 PM")
 */
export function formatFullDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
