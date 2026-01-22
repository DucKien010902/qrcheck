"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import { apiUrl } from "@/lib/api";




export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  

  async function onLogin() {
    setErr(null);
    if (!pin || pin.length < 4) return setErr("PIN tối thiểu 4 ký tự.");

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/admin/login"), {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pin }),
});

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || "Đăng nhập thất bại.");
        return;
      }

      // Cookie đã được set từ server -> đi thẳng vào admin
      router.replace(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-neutral-900">Admin Login</h1>
          <p className="mt-1 text-sm text-neutral-600">Nhập PIN để vào trang quản trị.</p>
        </div>

        <Card title="Đăng nhập">
          <div className="space-y-3">
            <Input
              label="PIN admin"
              type="password"
              inputMode="numeric"
              placeholder="Nhập PIN admin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              error={err || undefined}
            />
            <Button className="w-full py-3 text-base" loading={loading} onClick={onLogin}>
              Đăng nhập
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
