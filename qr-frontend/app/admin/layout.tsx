"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { apiUrl } from "@/lib/api";



export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
  sessionStorage.setItem("admin_session", "false"); // chỉ để UI
  await fetch(apiUrl("/api/admin/logout"), {
  method: "POST",
  credentials: "include",
});

  router.push("/admin/login");
}


  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="font-semibold text-neutral-900">QR Manager · Admin</div>

          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-xl px-3 py-2 hover:bg-neutral-100" href="/admin">
              Dashboard
            </Link>
            <Link className="rounded-xl px-3 py-2 hover:bg-neutral-100" href="/admin/new">
              Tạo voucher
            </Link>

            <Button variant="secondary" onClick={logout}>
              Đăng xuất
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
