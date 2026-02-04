import Link from "next/link";

const BRAND = "#b6202b";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function HomeCard({
  href,
  title,
  desc,
  badge,
}: {
  href: string;
  title: string;
  desc: string;
  badge: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5",
        "shadow-sm ring-1 ring-black/5 transition",
        "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      {/* Accent line */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: BRAND }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-neutral-900">
            {title}
          </div>
          <div className="mt-1 text-sm text-neutral-600">{desc}</div>
        </div>

        <span
          className="inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium text-neutral-900"
          style={{ backgroundColor: "#f8e7e9", borderColor: BRAND }}
        >
          <span
            className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: BRAND }}
          />
          {badge}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-neutral-500">Mở trang</div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 transition group-hover:bg-white">
          <span className="text-neutral-700">Đi tới</span>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(182,32,43,0.10)" }}
            aria-hidden
          >
            <span className="text-neutral-900">→</span>
          </span>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full"
        style={{ backgroundColor: "rgba(182,32,43,0.08)" }}
      />
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top brand line */}
      <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-2xl"
                style={{ backgroundColor: BRAND }}
                aria-hidden
              />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  QR Voucher Manager
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Admin tạo voucher → khách quét QR → cửa hàng check/redeem
                  nhanh, có log và ảnh xác nhận.
                </p>
              </div>
            </div>
          </div>

          {/* Quick info (no colored text) */}
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/5">
            <div className="text-neutral-900 font-medium">Môi trường demo</div>
            <div className="text-neutral-600">
              Giao diện đồng bộ · Accent {BRAND}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <HomeCard
            href="/admin"
            title="Admin Console"
            desc="Tạo, quản lý, theo dõi trạng thái voucher. Tải QR, copy link, xem ảnh redeem."
            badge="Admin"
          />

          <HomeCard
            href="/check/DEMO000000"
            title="Cửa hàng (Check)"
            desc="Mở bằng mã voucher (từ QR). Thực hiện kiểm tra, xác nhận và lưu trạng thái sử dụng."
            badge="Check"
          />
        </div>

        {/* Footer note */}
        <div className="mt-8 text-xs text-neutral-500">
          Gợi ý: Bạn có thể thay{" "}
          <span className="font-medium text-neutral-700">DEMO000000</span> bằng
          mã thật để test luồng end-to-end.
        </div>
      </div>
    </div>
  );
}
