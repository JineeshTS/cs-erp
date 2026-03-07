import Link from "next/link";
import type { NavCategory } from "@/lib/navigation/categories";
import { canSeeModule } from "@/lib/navigation/categories";

interface CategoryHubPageProps {
  category: NavCategory;
  permissions: string[];
}

export function CategoryHubPage({ category, permissions }: CategoryHubPageProps) {
  const visibleModules = category.modules.filter((m) =>
    canSeeModule(permissions, m.permissionPrefix)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{category.label}</h1>
        <p className="text-sm text-gray-500">
          Select a module to get started.
        </p>
      </div>

      {visibleModules.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            No modules available for your current role.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group rounded-lg border bg-white p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200">
                <mod.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{mod.title}</h3>
              <p className="mt-1 text-xs text-gray-500">{mod.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
