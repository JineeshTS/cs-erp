import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_ADDRESS = process.env.SMTP_FROM || "noreply@example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
const APP_NAME = "CS ERP";

function isConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isConfigured()) {
    console.warn("[email] SMTP not configured — skipping email send");
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Branded email wrapper — consistent look for all CS-ERP emails.
 */
function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0f1d32;padding:24px 32px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background:#2563eb;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                <span style="color:#fff;font-size:18px;font-weight:bold;">⛴</span>
              </td>
              <td style="padding-left:12px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:-0.5px;">${APP_NAME}</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
              This email was sent by ${APP_NAME} — Container Shipping Enterprise Platform.
              <br>If you did not request this action, you can safely ignore this email.
            </p>
            <p style="margin:8px 0 0;color:#cbd5e1;font-size:11px;">
              &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:700;">Password Reset</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
      We received a request to reset the password for your ${APP_NAME} account associated with <strong>${to}</strong>.
    </p>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#2563eb;border-radius:8px;padding:12px 32px;">
        <a href="${resetUrl}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
          Reset Password
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0;color:#2563eb;font-size:13px;word-break:break-all;">
      ${resetUrl}
    </p>
  `;

  try {
    await t.sendMail({
      from: `${APP_NAME} <${FROM_ADDRESS}>`,
      to,
      subject: `${APP_NAME} — Password Reset Request`,
      html: emailLayout(content),
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send password reset:", error);
    return false;
  }
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const content = `
    <div style="color:#334155;font-size:15px;line-height:1.6;">
      ${html}
    </div>
  `;

  try {
    await t.sendMail({
      from: `${APP_NAME} <${FROM_ADDRESS}>`,
      to,
      subject,
      html: emailLayout(content),
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send notification:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  to: string,
  displayName: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const content = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;font-weight:700;">Welcome to ${APP_NAME}</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
      Hi <strong>${displayName}</strong>, your account has been created successfully.
    </p>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
      ${APP_NAME} is your AI-powered container shipping enterprise platform for managing bookings, customs, vessel operations, and financials — all in one place.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#2563eb;border-radius:8px;padding:12px 32px;">
        <a href="${APP_URL}/login" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
          Sign In to Dashboard
        </a>
      </td></tr>
    </table>
    <p style="margin:0;color:#94a3b8;font-size:13px;">
      If you have any questions, contact your account administrator.
    </p>
  `;

  try {
    await t.sendMail({
      from: `${APP_NAME} <${FROM_ADDRESS}>`,
      to,
      subject: `Welcome to ${APP_NAME}`,
      html: emailLayout(content),
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send welcome email:", error);
    return false;
  }
}
