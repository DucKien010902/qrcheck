"use client";

import { useState } from "react";
import { Badge, Button, Card, Input } from "@/components/ui";
import { apiUrl } from "@/lib/api";



type Created = { code: string; link: string; qrDataUrl: string; discountPercent: number; expiresAt: string };

export default function AdminNewVoucherPage() {
  const [discountPercent, setDiscountPercent] = useState("10");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [quantity, setQuantity] = useState("1");

  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Created[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function onCreate() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/admin/vouchers"), {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    discountPercent: Number(discountPercent),
    expiresInDays: Number(expiresInDays),
    quantity: Number(quantity),
  }),
});

      const data = await res.json();
      if (!res.ok) return setErr(data?.message || "Tạo voucher thất bại.");
      setCreated(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Tạo voucher</h1>
        <p className="mt-1 text-sm text-neutral-600">
  Tạo code 10 ký tự (chữ + số), sinh link <span className="font-mono">/check/&lt;code&gt;</span> và QR để in/dán.
</p>

      </div>

      <Card title="Thiết lập">
        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Giảm (%)" inputMode="numeric" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
          <Input label="Hết hạn (ngày)" inputMode="numeric" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} />
          <Input label="Số lượng" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <div className="mt-4">
          <Button loading={loading} onClick={onCreate}>
            Tạo
          </Button>
        </div>
      </Card>

      {!!created.length && (
        <Card title="Kết quả">
          <div className="grid gap-4 md:grid-cols-2">
            {created.map((x) => (
              <div key={x.code} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{x.code}</div>
                  <Badge>{x.discountPercent}%</Badge>
                </div>
                <div className="mt-2 text-xs text-neutral-600 break-all">{x.link}</div>
                <div className="mt-3">
                  <img src={x.qrDataUrl} alt={x.code} className="h-44 w-44 rounded-xl border" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
