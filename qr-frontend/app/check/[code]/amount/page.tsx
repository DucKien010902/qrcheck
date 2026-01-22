"use client";
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Badge, Button, Card, Input } from "@/components/ui";
import { formatVND, parseMoney } from "@/lib/money";
import { apiUrl } from "@/lib/api";

export default function AmountPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const routeParams = useParams<{ code: string }>();

  const code = useMemo(() => String(routeParams?.code || "").toUpperCase(), [routeParams?.code]);
  const discountPercent = Number(sp.get("discount") ?? 0);

  const [pin, setPin] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const amount = parseMoney(rawAmount);
  const discount = Math.round((amount * discountPercent) / 100);
  const finalAmount = Math.max(0, amount - discount);

  async function onRedeem() {
    setMsg(null);

    if (!pin || pin.length < 4) return setMsg({ type: "err", text: "Vui lòng nhập PIN hợp lệ." });
    if (amount <= 0) return setMsg({ type: "err", text: "Vui lòng nhập số tiền hợp lệ." });

    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/store/vouchers/${code}/redeem`), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pin, amount }),
});
      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: "err", text: data?.message || "Redeem thất bại." });
        return;
      }

      setMsg({ type: "ok", text: "Redeem thành công. Voucher đã được đánh dấu đã dùng." });
      setTimeout(() => router.push(`/check/${code}`), 1200);
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
          <h1 className="text-xl font-semibold text-neutral-900">Cửa hàng · Tính tiền</h1>
          <p className="mt-1 text-sm text-neutral-600">Nhập tổng tiền, hệ thống tính chính xác số tiền cuối cùng.</p>
        </div>

        <Card title="Voucher" right={<Badge>{code}</Badge>}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Giảm giá</span>
            <span className="text-lg font-semibold text-neutral-900">{discountPercent}%</span>
          </div>
        </Card>

        <div className="mt-4 space-y-4">
          <Card title="Nhập liệu">
            <div className="space-y-3">
              <Input
                label="PIN cửa hàng"
                type="password"
                inputMode="numeric"
                placeholder="Nhập PIN để redeem"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <Input
                label="Tổng tiền trước giảm"
                inputMode="numeric"
                placeholder="Ví dụ: 250000"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                hint="Có thể nhập 250,000 hoặc 250000."
              />
            </div>
          </Card>

          <Card title="Kết quả">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Tổng tiền</span>
                <span className="font-medium">{formatVND(amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Giảm ({discountPercent}%)</span>
                <span className="font-medium">- {formatVND(discount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t pt-2">
                <span className="font-semibold text-neutral-900">Khách cần trả</span>
                <span className="font-semibold text-neutral-900">{formatVND(finalAmount)}</span>
              </div>
            </div>
          </Card>

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

          <Button className="w-full py-3 text-base" loading={loading} onClick={onRedeem}>
            Redeem (dùng 1 lần)
          </Button>

          <Button className="w-full py-3 text-base" variant="secondary" onClick={() => router.push(`/check/${code}`)}>
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
