"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { apiUrl } from "@/lib/api";
import PinInput from "@/components/pinInput";

const BRAND = "#b6202b";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = pin.length === 4 && !loading;

  async function onLogin(p?: string) {
    const value = (p ?? pin).trim();
    setErr(null);

    if (!/^\d{4}$/.test(value)) {
      setErr("PIN phải đúng 4 số.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: value }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || "PIN không đúng. Vui lòng thử lại.");
        setPin(""); // reset để nhập lại
        return;
      }

      localStorage.setItem("admin_token", data.token);
      router.replace(next);
    } finally {
      setLoading(false);
    }
  }

  // auto submit khi đủ 4 số
  useEffect(() => {
    if (pin.length === 4) onLogin(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />

      <div className="mx-auto flex min-h-[calc(100vh-4px)] max-w-md items-center px-4 py-10">
        <Card
          title="Admin Login"
          accent
          className="w-full"
          right={<span className="text-xs text-neutral-500">PIN 4 số</span>}
        >
          <div className="space-y-5">
            <div className="text-sm text-neutral-600">
              Nhập PIN để truy cập Admin Console.
            </div>

            <PinInput
              value={pin}
              onChange={(v) => {
                setErr(null);
                setPin(v);
              }}
              disabled={loading}
              error={err}
              hint={
                loading ? "Đang xác thực..." : "Bạn có thể dán (paste) 4 số."
              }
            />

            <Button
              className="w-full"
              loading={loading}
              onClick={() => onLogin()}
              disabled={!canSubmit}
            >
              Đăng nhập
            </Button>

            <div className="text-center text-xs text-neutral-500">
              Mẹo: nhập đủ 4 số sẽ tự đăng nhập.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
