export function parseDuration(v?: string | number): number {
  const DEFAULT = 7 * 24 * 3600;
  if (v === undefined || v === null) return DEFAULT;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (!s) return DEFAULT;

  if (/^\d+$/.test(s)) return Number(s);

  const m = s.match(/^(\d+)([smhd])$/);
  if (!m) return DEFAULT;
  const n = Number(m[1]);
  const unit = m[2];
  switch (unit) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 24 * 3600;
    default:
      return DEFAULT;
  }
}
