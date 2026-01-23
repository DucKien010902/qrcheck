"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Input } from "@/components/ui";
import { apiFetch } from "@/lib/apiFetch";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type Voucher = {
  code: string;
  discountPercent: number;
  expiresAt: string;
  redeemedAt: string | null;

  link?: string;
  qrDataUrl?: string;
  redeemedImageUrl?: string | null;
};

const BRAND = "#b6202b";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminDashboardPage() {
  const [items, setItems] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "used" | "unused">("all");

  const [viewImage, setViewImage] = useState<{ code: string; url: string } | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  const frontendBase = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return "http://localhost:3000";
  }, []);

  async function load() {
    setLoading(true);
    const res = await apiFetch("/api/admin/vouchers");
    const data = await res.json().catch(() => ({}));
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const total = items.length;
  const used = items.filter((x) => x.redeemedAt).length;
  const unused = total - used;
  const usedRate = total ? Math.round((used / total) * 100) : 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((v) => {
      const okQuery = !q || v.code.toLowerCase().includes(q);
      const okStatus =
        status === "all" ? true : status === "used" ? Boolean(v.redeemedAt) : !v.redeemedAt;
      return okQuery && okStatus;
    });
  }, [items, query, status]);

  async function copy(text: string, code: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 900);
  }

  function downloadQr(qrDataUrl?: string, code?: string) {
    if (!qrDataUrl || !code) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function getLink(v: Voucher) {
    return v.link || `${frontendBase}/check/${v.code}`;
  }

  function openImage(v: Voucher) {
    const url = v.redeemedImageUrl || "";
    if (!url) return;
    setRotation(0);
    setViewImage({ code: v.code, url });
  }

  function closeImage() {
    setViewImage(null);
    setRotation(0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Theo dõi voucher đã tạo và trạng thái sử dụng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={load} loading={loading}>
            Tải lại
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              // bạn có thể route sang /admin/new nếu muốn
              window.location.href = "/admin/new";
            }}
          >
            Tạo voucher
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Tổng số voucher" accent>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-semibold text-neutral-900">{total}</div>
            <Badge tone="brand">Tổng</Badge>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
            <div
              className="h-2 rounded-full"
              style={{ width: `${Math.min(100, usedRate)}%`, backgroundColor: BRAND }}
            />
          </div>
          <div className="mt-2 text-xs text-neutral-500">{usedRate}% đã sử dụng</div>
        </Card>

        <Card title="Đã sử dụng">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-semibold text-neutral-900">{used}</div>
            <Badge tone="yellow">Đã dùng</Badge>
          </div>
          <div className="mt-2 text-xs text-neutral-500">Có redeem thành công</div>
        </Card>

        <Card title="Chưa sử dụng">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-semibold text-neutral-900">{unused}</div>
            <Badge tone="green">Chưa dùng</Badge>
          </div>
          <div className="mt-2 text-xs text-neutral-500">Có thể chia sẻ tiếp</div>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card
        title="Danh sách voucher"
        right={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Tìm theo code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                className={cx(
                  "rounded-xl border px-3 py-2 text-sm transition",
                  "border-neutral-200 bg-white hover:bg-neutral-50",
                  status === "all" && "bg-neutral-100"
                )}
                style={
                  status === "all"
                    ? { boxShadow: "inset 0 0 0 2px rgba(182,32,43,0.15)" }
                    : undefined
                }
                onClick={() => setStatus("all")}
              >
                Tất cả
              </button>
              <button
                className={cx(
                  "rounded-xl border px-3 py-2 text-sm transition",
                  "border-neutral-200 bg-white hover:bg-neutral-50",
                  status === "unused" && "bg-neutral-100"
                )}
                style={
                  status === "unused"
                    ? { boxShadow: "inset 0 0 0 2px rgba(182,32,43,0.15)" }
                    : undefined
                }
                onClick={() => setStatus("unused")}
              >
                Chưa dùng
              </button>
              <button
                className={cx(
                  "rounded-xl border px-3 py-2 text-sm transition",
                  "border-neutral-200 bg-white hover:bg-neutral-50",
                  status === "used" && "bg-neutral-100"
                )}
                style={
                  status === "used"
                    ? { boxShadow: "inset 0 0 0 2px rgba(182,32,43,0.15)" }
                    : undefined
                }
                onClick={() => setStatus("used")}
              >
                Đã dùng
              </button>
            </div>
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-600">
                <tr className="border-b border-neutral-200">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Giảm</th>
                  <th className="px-4 py-3">Hết hạn</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filtered.map((v) => {
                  const link = getLink(v);
                  const canViewImage = Boolean(v.redeemedAt && v.redeemedImageUrl);

                  return (
                    <tr key={v.code} className="bg-white hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900">{v.code}</div>
                        <div className="mt-0.5 text-xs text-neutral-500">
                          {v.redeemedAt ? "Đã redeem" : "Chưa redeem"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-neutral-900">{v.discountPercent}%</td>

                      <td className="px-4 py-3 text-neutral-900">
                        {new Date(v.expiresAt).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        {v.redeemedAt ? (
                          <Badge tone="yellow">Đã dùng</Badge>
                        ) : (
                          <Badge tone="green">Chưa dùng</Badge>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            className="h-8 px-3 text-xs"
                            variant="secondary"
                            onClick={() => copy(link, v.code)}
                          >
                            {copiedCode === v.code ? "Đã copy" : "Copy link"}
                          </Button>

                          <Button
                            className="h-8 px-3 text-xs"
                            variant="secondary"
                            onClick={() => downloadQr(v.qrDataUrl, v.code)}
                            disabled={!v.qrDataUrl}
                          >
                            Tải QR
                          </Button>

                          {v.redeemedAt && (
                            <Button
                              className="h-8 px-3 text-xs"
                              variant="secondary"
                              onClick={() => openImage(v)}
                              disabled={!canViewImage}
                              title={
                                canViewImage ? "Xem ảnh redeem" : "Voucher đã dùng nhưng chưa có ảnh"
                              }
                            >
                              Xem ảnh
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!filtered.length && !loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                      Không có dữ liệu phù hợp bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal xem ảnh */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeImage}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs text-neutral-500">Voucher</div>
                <div className="text-base font-semibold text-neutral-900">{viewImage.code}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => window.open(viewImage.url, "_blank")}
                >
                  Mở tab mới
                </Button>
                <Button variant="primary" onClick={closeImage}>
                  Đóng
                </Button>
              </div>
            </div>

            <div className="bg-neutral-50">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={6}
                wheel={{ step: 0.12 }}
                doubleClick={{ mode: "zoomIn" }}
                pinch={{ step: 5 }}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 bg-white p-2">
                      <Button className="h-8 px-3 text-xs" variant="secondary" onClick={() => zoomOut()}>
                        Thu -
                      </Button>
                      <Button className="h-8 px-3 text-xs" variant="secondary" onClick={() => zoomIn()}>
                        Phóng +
                      </Button>

                      <Button
                        className="h-8 px-3 text-xs"
                        variant="secondary"
                        onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      >
                        Xoay trái
                      </Button>
                      <Button
                        className="h-8 px-3 text-xs"
                        variant="secondary"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                      >
                        Xoay phải
                      </Button>

                      <Button
                        className="h-8 px-3 text-xs"
                        variant="secondary"
                        onClick={() => {
                          setRotation(0);
                          resetTransform();
                        }}
                      >
                        Reset
                      </Button>

                      <div className="ml-auto text-xs text-neutral-500">
                        Lăn chuột / pinch để zoom, kéo để di chuyển
                      </div>
                    </div>

                    <div className="relative h-[72vh] w-full overflow-hidden">
                      <TransformComponent
                        wrapperClass="!w-full !h-full"
                        contentClass="!w-full !h-full flex items-center justify-center"
                      >
                        <img
                          src={viewImage.url}
                          alt={`redeem-${viewImage.code}`}
                          className="max-h-full max-w-full select-none"
                          style={{ transform: `rotate(${rotation}deg)` }}
                          draggable={false}
                        />
                      </TransformComponent>
                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
