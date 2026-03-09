"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface FieldErrors {
  [key: string]: string[];
}

const COUNTRIES = [
  { code: "QA", name: "Qatar", tz: "Asia/Qatar" },
  { code: "AE", name: "UAE", tz: "Asia/Dubai" },
  { code: "SA", name: "Saudi Arabia", tz: "Asia/Riyadh" },
  { code: "IN", name: "India", tz: "Asia/Kolkata" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tenantName: "",
    displayName: "",
    email: "",
    password: "",
    country: "QA",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const countryData = COUNTRIES.find((c) => c.code === form.country);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          timezone: countryData?.tz || "Asia/Qatar",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.error?.details) {
          setFieldErrors(
            typeof data.error.details === "object"
              ? data.error.details
              : {}
          );
        }
        setError(data.error?.message || "Registration failed");
        return;
      }

      router.replace(data.data?.redirect || "/onboarding");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Set up your organization and admin account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Company Name
            </label>
            <Input
              placeholder="Acme Shipping LLC"
              value={form.tenantName}
              onChange={(e) => update("tenantName", e.target.value)}
              required
              disabled={loading}
            />
            {fieldErrors.tenantName && (
              <p className="text-xs text-red-600">{fieldErrors.tenantName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Your Name
            </label>
            <Input
              placeholder="Ahmed Al-Mansour"
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              type="password"
              placeholder="Min 12 chars, mixed case, number, special"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              disabled={loading}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Already have an account? Sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
