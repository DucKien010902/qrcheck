import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pin } = await req.json();
  const ADMIN_PIN = process.env.ADMIN_PIN || "9999";

  if (!pin || pin !== ADMIN_PIN) {
    // session = false -> không set cookie
    return NextResponse.json({ message: "PIN admin không đúng." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });

  // Cookie dạng SESSION: không set maxAge/expires
  res.cookies.set("admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
