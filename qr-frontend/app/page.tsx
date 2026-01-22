import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-neutral-900">QR Voucher Manager</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Demo UI + logic. Admin tạo voucher → khách quét QR vào trang cửa hàng để check/redeem.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link className="rounded-2xl border bg-white p-5 shadow-sm hover:bg-neutral-50" href="/admin">
            <div className="text-base font-semibold">Admin</div>
            <div className="mt-1 text-sm text-neutral-600">Tạo & theo dõi voucher</div>
          </Link>

          <Link className="rounded-2xl border bg-white p-5 shadow-sm hover:bg-neutral-50" href="/check/DEMO000000">
            <div className="text-base font-semibold">Cửa hàng (Check)</div>
            <div className="mt-1 text-sm text-neutral-600">Vào theo mã voucher từ QR</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
