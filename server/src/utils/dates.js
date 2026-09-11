export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function parseRelativeFollowUp(text, fallbackDays = 2) {
  const source = String(text || '').toLowerCase();
  if (/day after tomorrow/.test(source)) return 2;
  if (/tomorrow/.test(source)) return 1;
  const match = source.match(/(\d+)\s*days?/);
  if (match) return Number(match[1]);
  if (/next week/.test(source)) return 7;
  return fallbackDays;
}
