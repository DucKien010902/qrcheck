export function parseMoney(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatVND(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("vi-VN") + " ₫";
}
