import { apiUrl } from "./api";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // ✅ CHỈ ADMIN API MỚI GẮN JWT
  if (token && path.startsWith("/api/admin")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
  });

  if (res.status === 401 && path.startsWith("/api/admin")) {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  return res;
}
