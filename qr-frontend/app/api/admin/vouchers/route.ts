import { NextResponse } from "next/server";
import { vouchersMap } from "@/app/api/db/route";

export async function GET() {
  const items = Array.from(vouchersMap().values()).sort((a, b) => b.code.localeCompare(a.code));
  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req: Request) {
  // Dùng luôn endpoint tạo của _db để gọn file
  const body = await req.json();

  const res = await fetch(new URL("/api/db", req.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
