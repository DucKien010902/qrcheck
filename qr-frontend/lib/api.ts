export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

export function apiUrl(path: string) {
  // path ví dụ: "/api/admin/login"
  return `${API_BASE}${path}`;
}
