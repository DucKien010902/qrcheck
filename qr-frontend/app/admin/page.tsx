"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { apiUrl } from "@/lib/api";

type Voucher = {
  code: string;
  discountPercent: number;
  expiresAt: string;
  redeemedAt: string | null;
  link?: string;
  qrDataUrl?: string;
};

export default function AdminDashboardPage() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Nếu backend không trả link, tự build link chuẩn để copy
  const frontendBase = useMemo(() => {
    // Ưu tiên dùng đúng domain đang mở (tránh sai env)
    if (typeof window !== "undefined") return window.location.origin;
    return "http://localhost:3000";
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch(apiUrl("/api/admin/vouchers"), {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const total = items.length;
  const used = items.filter((x) => x.redeemedAt).length;

  async function copy(text: string, code: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 900);
    } catch {
      // fallback cũ cho trình duyệt hạn chế
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 900);
    }
  }

  function getLink(v: Voucher) {
    return v.link || `${frontendBase}/check/${v.code}`;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">Theo dõi voucher đã tạo và trạng thái sử dụng.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Tổng số voucher">
          <div className="text-3xl font-semibold">{total}</div>
        </Card>
        <Card title="Đã sử dụng">
          <div className="text-3xl font-semibold">{used}</div>
        </Card>
        <Card title="Chưa sử dụng">
          <div className="text-3xl font-semibold">{total - used}</div>
        </Card>
      </div>

      <Card
        title="Danh sách"
        right={
          <Button variant="secondary" onClick={load}>
            {loading ? "..." : "Tải lại"}
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr className="border-b">
                <th className="py-2 pr-3">Code</th>
                <th className="py-2 pr-3">Giảm</th>
                <th className="py-2 pr-3">Hết hạn</th>
                <th className="py-2 pr-3">Trạng thái</th>
                <th className="py-2">Link</th>
              </tr>
            </thead>

            <tbody>
              {items.map((v) => {
                const link = getLink(v);
                return (
                  <tr key={v.code} className="border-b last:border-b-0 align-top">
                    <td className="py-2 pr-3 font-medium">{v.code}</td>
                    <td className="py-2 pr-3">{v.discountPercent}%</td>
                    <td className="py-2 pr-3">{new Date(v.expiresAt).toLocaleString()}</td>
                    <td className="py-2 pr-3">
                      {v.redeemedAt ? <Badge tone="yellow">Đã dùng</Badge> : <Badge tone="green">Chưa dùng</Badge>}
                    </td>

                    <td className="py-2">
                      <div className="flex max-w-[520px] items-center gap-2">
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate rounded-lg px-2 py-1 font-mono text-xs text-neutral-700 hover:bg-neutral-100"
                          title={link}
                        >
                          {link}
                        </a>

                        <Button
                          variant="secondary"
                          className="shrink-0"
                          onClick={() => copy(link, v.code)}
                        >
                          {copiedCode === v.code ? "Đã copy" : "Copy"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!items.length && !loading && (
                <tr>
                  <td colSpan={5} className="py-3 text-neutral-500">
                    Chưa có voucher nào. Qua “Tạo voucher” để tạo mới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
