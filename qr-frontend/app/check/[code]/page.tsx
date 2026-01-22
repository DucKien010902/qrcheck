"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge, Button, Card, Input } from "@/components/ui";
import { apiUrl } from "@/lib/api";

export default function StoreCheckPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();

  const code = useMemo(() => String(params?.code || "").toUpperCase(), [params?.code]);

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onCheck() {
    setMsg(null);

    if (!pin || pin.length < 4) {
      setMsg({ type: "err", text: "Vui lòng nhập PIN (tối thiểu 4 ký tự)." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/store/vouchers/${code}/check`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ type: "err", text: data?.message || "Không kiểm tra được voucher." });
        return;
      }

      setMsg({ type: "ok", text: "Voucher hợp lệ. Chuyển sang nhập số tiền..." });
      router.push(`/check/${code}/amount?discount=${data.discountPercent}`);
    } catch {
      setMsg({ type: "err", text: "Lỗi mạng hoặc server. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-md px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-neutral-900">Cửa hàng · Check voucher</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Tối ưu cho điện thoại khi quét QR. Cần PIN mới kiểm tra được.
          </p>
        </div>

        <Card title="Mã voucher" right={<Badge>{code}</Badge>}>
          <div className="space-y-3">
            <Input
              label="PIN cửa hàng"
              type="password"
              inputMode="numeric"
              placeholder="Nhập PIN để check"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              hint="PIN sẽ được backend xác thực."
            />

            {msg && (
              <div
                className={
                  "rounded-xl border px-3 py-2 text-sm " +
                  (msg.type === "ok"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800")
                }
              >
                {msg.text}
              </div>
            )}

            <Button className="w-full py-3 text-base" loading={loading} onClick={onCheck}>
              Check
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
