export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          CS ERP
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Container Shipping Enterprise Resource Planning
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
