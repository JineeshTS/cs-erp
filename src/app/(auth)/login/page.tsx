"use client";

import { useState, useEffect } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  // Countdown timer to re-enable the form after rate limiting
  useEffect(() => {
    if (retryAfter === null) return;
    const timer = setTimeout(() => {
      setRetryAfter(null);
      setError(null);
    }, retryAfter * 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.details) {
          setFieldErrors(data.details);
        } else if (res.status === 429 || res.status === 423) {
          const seconds = data.retryAfter || 60;
          setRetryAfter(seconds);
          setError(
            `Too many attempts. Please try again in ${Math.ceil(seconds / 60)} minute(s).`
          );
        } else {
          setError(data.error || "Login failed");
        }
        return;
      }

      // Redirect to dashboard or callback URL (validate to prevent open redirect)
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("callbackUrl") || "/";
      const callbackUrl = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
      router.replace(callbackUrl);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
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
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600">{fieldErrors.password[0]}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || retryAfter !== null}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-gray-500 hover:text-gray-700"
            >
              Forgot your password?
            </Link>
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
