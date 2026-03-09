import { Ship } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-[480px] flex-col justify-between bg-[#0f1d32] p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Ship className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">CS ERP</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold leading-tight">
            Container Shipping
            <br />
            Enterprise Platform
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            AI-powered shipping operations management for Qatar, UAE, KSA, and
            India. Streamline bookings, customs, vessel management, and
            financials in one platform.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} CS ERP. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f8fafc] px-4">
        <div className="mb-8 text-center lg:hidden">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f1d32] text-white">
            <Ship className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            CS ERP
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Container Shipping Enterprise Platform
          </p>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
