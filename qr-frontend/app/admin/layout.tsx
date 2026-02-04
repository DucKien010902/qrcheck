"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { apiUrl } from "@/lib/api";

const BRAND = "#b6202b";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    sessionStorage.setItem("admin_session", "false"); // chỉ để UI
    await fetch(apiUrl("/api/admin/logout"), {
      method: "POST",
      credentials: "include",
    });
    router.push("/admin/login");
  }

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/new", label: "Tạo voucher" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* top brand line */}
      <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />

      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl"
              style={{ backgroundColor: BRAND }}
              aria-hidden
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-neutral-900">
                QR Manager
              </div>
              <div className="text-xs text-neutral-500">Admin Console</div>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            {nav.map((x) => {
              const active = pathname === x.href;
              return (
                <Link
                  key={x.href}
                  href={x.href}
                  className={cx(
                    "rounded-xl px-3 py-2 transition",
                    "hover:bg-neutral-100",
                    active && "bg-neutral-100",
                  )}
                  style={
                    active
                      ? {
                          boxShadow: "inset 0 0 0 2px rgba(182,32,43,0.18)",
                        }
                      : undefined
                  }
                >
                  <span className="text-neutral-900">{x.label}</span>
                </Link>
              );
            })}

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
