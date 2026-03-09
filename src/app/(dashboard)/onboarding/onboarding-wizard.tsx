"use client";

import { useState } from "react";
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

interface OnboardingWizardProps {
  tenantId: string;
  tenantName: string;
  currency: string;
}

export function OnboardingWizard({
  tenantId,
  tenantName,
  currency,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(tenantName);
  const [cur, setCur] = useState(currency);
  const [inviteEmail, setInviteEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveOrgDetails() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency: cur }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message || "Failed to save");
        return;
      }
      setStep(2);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) {
      setStep(3);
      return;
    }
    setSaving(true);
    try {
      await fetch(`/api/v1/tenants/${tenantId}/members/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          displayName: inviteEmail.split("@")[0],
          roleId: "", // This would need a valid role ID — simplified for now
        }),
      });
    } catch {
      // Non-blocking
    }
    setSaving(false);
    setStep(3);
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      // Mark tenant as onboarded
      await fetch(`/api/v1/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { onboarded: true } }),
      });
      // Also set onboarded_at via a separate call pattern
      // The PATCH handler already handles arbitrary settings update
      router.push("/");
    } catch {
      router.push("/");
    }
    setSaving(false);
  }

  const CURRENCIES = ["QAR", "AED", "SAR", "INR", "USD"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {step === 1 && "Confirm Organization Details"}
          {step === 2 && "Invite Team Members"}
          {step === 3 && "You are All Set!"}
        </CardTitle>
        <CardDescription>
          Step {step} of 3
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Organization Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Currency</label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={cur}
                onChange={(e) => setCur(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Invite a team member (optional)
            </label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <p className="text-xs text-gray-400">
              You can invite more team members later from the admin panel.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Setup Complete</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your organization is ready. Head to the dashboard to get started.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {step > 1 && step < 3 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step === 1 && (
          <Button onClick={saveOrgDetails} disabled={saving} className="ms-auto">
            {saving ? "Saving..." : "Continue"}
          </Button>
        )}
        {step === 2 && (
          <Button onClick={sendInvite} disabled={saving} className="ms-auto">
            {inviteEmail.trim() ? "Send Invite & Continue" : "Skip"}
          </Button>
        )}
        {step === 3 && (
          <Button onClick={completeOnboarding} disabled={saving} className="ms-auto">
            Go to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
