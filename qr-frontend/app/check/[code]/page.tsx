"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import { apiFetch } from "@/lib/apiFetch";
import PinInput from "@/components/pinInput";

type VoucherCheckRes = { discountPercent: number };

const BRAND = "#b6202b";

export default function StoreCheckPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();

  const code = useMemo(
    () => String(params?.code || "").toUpperCase(),
    [params?.code]
  );

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onCheck(p?: string) {
    const value = (p ?? pin).trim();
    setMsg(null);

    if (!/^\d{4}$/.test(value)) {
      setMsg({ type: "err", text: "PIN phải đúng 4 số." });
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`/api/store/vouchers/${code}/check`, {
        method: "POST",
        body: JSON.stringify({ pin: value }),
      });

      const data = (await res.json().catch(() => ({}))) as Partial<VoucherCheckRes> & {
        message?: string;
      };

      if (!res.ok) {
        setMsg({ type: "err", text: data?.message || "PIN sai hoặc voucher không hợp lệ." });
        setPin(""); // reset để nhập lại
        return;
      }

      setMsg({ type: "ok", text: "Voucher hợp lệ. Đang chuyển bước..." });
      router.push(`/check/${code}/amount?discount=${data.discountPercent}`);
    } catch {
      setMsg({ type: "err", text: "Lỗi mạng hoặc server. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  }

  // auto submit khi đủ 4 số
  useEffect(() => {
    if (pin.length === 4) onCheck(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />

      <div className="mx-auto flex min-h-[calc(100vh-4px)] max-w-md items-center px-4 py-10">
        <Card
          title="Cửa hàng · Check voucher"
          accent
          className="w-full"
          right={<Badge tone="brand">{code}</Badge>}
        >
          <div className="space-y-5">
            <p className="text-sm text-neutral-600">
              Nhập PIN cửa hàng để xác thực voucher. Tối ưu cho điện thoại khi quét QR.
            </p>

            <PinInput
              value={pin}
              onChange={(v) => {
                setMsg(null);
                setPin(v);
              }}
              disabled={loading}
              error={msg?.type === "err" ? msg.text : null}
              hint={loading ? "Đang kiểm tra..." : "Nhập đủ 4 số sẽ tự kiểm tra."}
            />

            {msg?.type === "ok" && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-neutral-900">
                <div className="font-medium">Thành công</div>
                <div className="mt-1 text-neutral-700">{msg.text}</div>
              </div>
            )}

            <Button
              className="w-full"
              loading={loading}
              onClick={() => onCheck()}
              disabled={pin.length !== 4 || loading}
            >
              Check
            </Button>

            <div className="text-center text-xs text-neutral-500">
              Bạn có thể dán (paste) 4 số để nhập nhanh.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
