import { NextResponse } from "next/server";
import { vouchersMap } from "@/app/api/db/route";

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const { pin, amount } = await req.json();
  const STORE_PIN = process.env.STORE_PIN || "1234";

  if (!pin || pin !== STORE_PIN) return NextResponse.json({ message: "PIN không đúng." }, { status: 401 });
  if (!amount || Number(amount) <= 0) return NextResponse.json({ message: "Số tiền không hợp lệ." }, { status: 400 });

  const code = (params.code || "").toUpperCase();
  const m = vouchersMap();
  const v = m.get(code);

  if (!v) return NextResponse.json({ message: "Voucher không tồn tại." }, { status: 404 });
  if (new Date(v.expiresAt).getTime() < Date.now())
    return NextResponse.json({ message: "Voucher đã hết hạn." }, { status: 410 });
  if (v.redeemedAt) return NextResponse.json({ message: "Voucher đã được sử dụng." }, { status: 409 });

  v.redeemedAt = new Date().toISOString();
  m.set(code, v);

  return NextResponse.json({ ok: true, redeemedAt: v.redeemedAt }, { status: 200 });
}
