"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Badge, Button, Card, Input } from "@/components/ui";
import PinInput from "@/components/pinInput";
import { formatVND, parseMoney } from "@/lib/money";
import { apiFetch } from "@/lib/apiFetch";

const BRAND = "#b6202b";

const CLOUDINARY_CLOUD_NAME = "da6f4dmql";
const CLOUDINARY_UPLOAD_PRESET = "qrcheck_unsigned_upload";

async function uploadToCloudinary(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const r = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || "Upload Cloudinary thất bại");

  return { url: data.secure_url as string, publicId: data.public_id as string };
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function AmountPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const routeParams = useParams<{ code: string }>();

  const code = useMemo(
    () => String(routeParams?.code || "").toUpperCase(),
    [routeParams?.code]
  );
  const discountPercent = Number(sp.get("discount") ?? 0);

  const [pin, setPin] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const amount = parseMoney(rawAmount);
  const discount = Math.round((amount * discountPercent) / 100);
  const finalAmount = Math.max(0, amount - discount);

  function onPickPhoto(file: File | null) {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function setQuickAmount(v: number) {
    setMsg(null);
    setRawAmount(String(v));
  }

  async function onRedeem() {
    setMsg(null);
    if (loading) return;

    if (!/^\d{4}$/.test(pin)) {
      setMsg({ type: "err", text: "PIN phải đúng 4 số." });
      return;
    }
    if (amount <= 0) {
      setMsg({ type: "err", text: "Vui lòng nhập số tiền hợp lệ." });
      return;
    }
    if (!photoFile) {
      setMsg({ type: "err", text: "Vui lòng chụp/tải ảnh xác nhận trước khi redeem." });
      return;
    }

    const ok = window.confirm(
      "Xác nhận redeem voucher? Ảnh sẽ được upload và voucher sẽ dùng 1 lần."
    );
    if (!ok) return;

    setLoading(true);
    try {
      const uploaded = await uploadToCloudinary(photoFile);

      const res = await apiFetch(`/api/store/vouchers/${code}/redeem`, {
        method: "POST",
        body: JSON.stringify({
          pin,
          amount,
          imageUrl: uploaded.url,
          imagePublicId: uploaded.publicId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg({ type: "err", text: data?.message || "Redeem thất bại." });
        return;
      }

      setMsg({ type: "ok", text: "Redeem thành công. Voucher đã được đánh dấu đã dùng." });
      setTimeout(() => router.push(`/check/${code}`), 1200);
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Lỗi mạng hoặc server. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  }

  const redeemDisabled = loading || !/^\d{4}$/.test(pin) || amount <= 0 || !photoFile;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Brand top line */}
      <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />

      {/* Mobile-first container */}
      <div className="mx-auto w-full max-w-md px-4 py-6 pb-28">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Cửa hàng · Tính tiền</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Nhập tổng tiền, hệ thống tính chính xác số tiền khách cần trả.
              </p>
            </div>

            <span
              className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-neutral-900"
              style={{ backgroundColor: "#f8e7e9", borderColor: BRAND }}
            >
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND }} />
              {discountPercent}%
            </span>
          </div>
        </div>

        {/* Voucher summary */}
        <Card title="Voucher" right={<Badge tone="brand">{code}</Badge>} accent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Giảm giá</span>
            <span className="text-lg font-semibold text-neutral-900">{discountPercent}%</span>
          </div>

          <div className="mt-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-black/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Sau giảm (ước tính)</span>
              <span className="font-semibold text-neutral-900">{formatVND(finalAmount)}</span>
            </div>
          </div>
        </Card>

        {/* Input section */}
        <div className="mt-4 space-y-4">
          <Card title="Xác thực & Nhập tiền" accent>
            <div className="space-y-5">
              {/* PIN */}
              <div>
                <div className="mb-2 text-sm font-medium text-neutral-900">PIN cửa hàng</div>
                <PinInput
                  value={pin}
                  onChange={(v) => {
                    setMsg(null);
                    setPin(v);
                  }}
                  disabled={loading}
                  error={
                    msg?.type === "err" && msg.text.toLowerCase().includes("pin")
                      ? msg.text
                      : null
                  }
                  hint={loading ? "Đang xử lý..." : "Nhập đúng 4 số."}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Input
                  label="Tổng tiền trước giảm"
                  inputMode="numeric"
                  placeholder="Ví dụ: 250000"
                  value={rawAmount}
                  onChange={(e) => {
                    setMsg(null);
                    setRawAmount(e.target.value);
                  }}
                  hint="Có thể nhập 250,000 hoặc 250000."
                  className="text-neutral-900"
                />

                {/* Quick picks for mobile */}
                <div className="flex flex-wrap gap-2">
                  {[50000, 100000, 200000, 500000, 1000000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setQuickAmount(v)}
                      className={cx(
                        "rounded-full border px-3 py-1.5 text-xs font-medium text-neutral-900",
                        "bg-white hover:bg-neutral-50"
                      )}
                      style={{
                        borderColor: "rgba(182,32,43,0.18)",
                        backgroundColor: "rgba(182,32,43,0.06)",
                      }}
                    >
                      {formatVND(v)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Photo proof */}
          {/* Photo proof */}
<Card title="Ảnh xác nhận" accent>
  <div className="space-y-3">
    <p className="text-sm text-neutral-600">
      Chụp hoặc tải ảnh để lưu bằng chứng redeem (bắt buộc).
    </p>

    <div className="grid gap-2">
      <label
        className="flex cursor-pointer items-center justify-center rounded-2xl border bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50"
        style={{
          borderColor: "rgba(182,32,43,0.22)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
        }}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        {photoFile ? "Chọn ảnh khác" : "Chụp / Chọn ảnh"}
      </label>

      {photoPreview ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <img
            src={photoPreview}
            alt="preview"
            className="h-48 w-full object-cover"
          />
          <div className="flex items-center justify-between gap-2 border-t border-neutral-100 p-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-neutral-900">
                Ảnh đã chọn
              </div>
              <div className="truncate text-xs text-neutral-500">
                {photoFile?.name || "photo.jpg"}
              </div>
            </div>

            <Button
              variant="secondary"
              className="h-9 px-3 text-xs"
              onClick={() => onPickPhoto(null)}
              type="button"
              disabled={loading}
            >
              Xoá
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-600">
          Chưa có ảnh. Hãy chụp hoặc chọn ảnh để tiếp tục.
        </div>
      )}
    </div>
  </div>
</Card>


          {/* Result */}
          <Card title="Kết quả tính tiền" accent>
            <div className="space-y-3">
              <div className="rounded-2xl bg-neutral-50 p-3 ring-1 ring-black/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Tổng tiền</span>
                  <span className="font-semibold text-neutral-900">{formatVND(amount)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Giảm ({discountPercent}%)</span>
                  <span className="font-semibold text-neutral-900">- {formatVND(discount)}</span>
                </div>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: "rgba(182,32,43,0.22)", backgroundColor: "rgba(182,32,43,0.06)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-600">Khách cần trả</div>
                    <div className="mt-1 text-2xl font-semibold text-neutral-900">
                      {formatVND(finalAmount)}
                    </div>
                  </div>
                  <div
                    className="h-10 w-10 rounded-2xl"
                    style={{ backgroundColor: "rgba(182,32,43,0.16)" }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Message */}
          {msg && (
            <div
              className={cx(
                "rounded-2xl border px-4 py-3 text-sm",
                msg.type === "ok"
                  ? "border-green-200 bg-green-50 text-neutral-900"
                  : "border-red-200 bg-red-50 text-neutral-900"
              )}
            >
              <div className="font-medium">
                {msg.type === "ok" ? "Thành công" : "Có lỗi"}
              </div>
              <div className="mt-1 text-neutral-700">{msg.text}</div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom actions (mobile optimized) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="w-full py-3 text-base"
              variant="secondary"
              onClick={() => router.push(`/check/${code}`)}
              disabled={loading}
            >
              Quay lại
            </Button>

            <Button
              className="w-full py-3 text-base"
              loading={loading}
              onClick={onRedeem}
              disabled={redeemDisabled}
            >
              Redeem
            </Button>
          </div>

          <div className="mt-2 text-center text-xs text-neutral-500">
            Redeem sẽ dùng voucher 1 lần và upload ảnh xác nhận.
          </div>
        </div>
      </div>
    </div>
  );
}
