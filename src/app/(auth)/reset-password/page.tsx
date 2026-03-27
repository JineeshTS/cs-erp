"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Card><CardContent className="p-8 text-center text-sm text-slate-500">Loading...</CardContent></Card>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Request a new reset link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.details?.password) {
          setError(data.details.password[0]);
        } else {
          setError(data.error || "Reset failed. The link may have expired.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>
            Your password has been reset successfully. You can now sign in with
            your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            Password updated. All existing sessions have been revoked for
            security.
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => router.replace("/login")}
          >
            Go to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your new password. Must be at least 12 characters with mixed
          case, a number, and a special character.
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
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Min 12 chars, mixed case, number, special"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Input
              id="confirm"
              type="password"
              placeholder="Re-enter your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
