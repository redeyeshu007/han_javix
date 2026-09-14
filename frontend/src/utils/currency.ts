// One centralized currency formatter for the app (Indian Rupee, Indian
// digit grouping). Never hardcode "$" in components.
export function formatINR(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '\u20B90';
  return '\u20B9' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
