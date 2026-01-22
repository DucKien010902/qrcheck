import { NextResponse } from "next/server";
import { vouchersMap } from "@/app/api/db/route";

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const { pin } = await req.json();
  const STORE_PIN = process.env.STORE_PIN || "1234";

  if (!pin || pin !== STORE_PIN) {
    return NextResponse.json({ message: "PIN không đúng." }, { status: 401 });
  }

  const code = (params.code || "").toUpperCase();
  const v = vouchersMap().get(code);

  if (!v) return NextResponse.json({ message: "Voucher không tồn tại." }, { status: 404 });
  if (new Date(v.expiresAt).getTime() < Date.now())
    return NextResponse.json({ message: "Voucher đã hết hạn." }, { status: 410 });
  if (v.redeemedAt) return NextResponse.json({ message: "Voucher đã được sử dụng." }, { status: 409 });

  return NextResponse.json({ discountPercent: v.discountPercent }, { status: 200 });
}
