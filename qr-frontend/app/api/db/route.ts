import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import QRCode from "qrcode";

type Voucher = {
  code: string;
  discountPercent: number;
  expiresAt: string;
  redeemedAt: string | null;
};

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const genCode = customAlphabet(alphabet, 10);

const g = globalThis as unknown as { vouchers?: Map<string, Voucher> };
g.vouchers ??= new Map<string, Voucher>();

function getMap() {
  return g.vouchers!;
}

async function createOne(discountPercent: number, expiresInDays: number) {
  const m = getMap();
  let code = "";
  do {
    code = genCode();
  } while (m.has(code));

  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const v: Voucher = { code, discountPercent, expiresAt, redeemedAt: null };
  m.set(code, v);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/check/${code}`;
  const qrDataUrl = await QRCode.toDataURL(link, { errorCorrectionLevel: "M" });

  return { ...v, link, qrDataUrl };
}

// Debug endpoint (không bắt buộc dùng)
export async function GET() {
  const items = Array.from(getMap().values());
  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const discountPercent = Number(body.discountPercent ?? 10);
  const expiresInDays = Number(body.expiresInDays ?? 30);
  const quantity = Math.min(100, Math.max(1, Number(body.quantity ?? 1)));

  const items = [];
  for (let i = 0; i < quantity; i++) items.push(await createOne(discountPercent, expiresInDays));

  return NextResponse.json({ items }, { status: 200 });
}

export function vouchersMap() {
  return getMap();
}
