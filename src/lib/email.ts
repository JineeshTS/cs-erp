import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_ADDRESS = "noreply@codilla.ai";

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

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://cs-erp.codilla.ai"}/auth/reset-password?token=${resetToken}`;

  try {
    await t.sendMail({
      from: FROM_ADDRESS,
      to,
      subject: "CS-ERP — Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset for your CS-ERP account.</p>
          <p>Click the link below to set a new password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
          <p style="color: #64748b; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
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

  try {
    await t.sendMail({ from: FROM_ADDRESS, to, subject, html });
    return true;
  } catch (error) {
    console.error("[email] Failed to send notification:", error);
    return false;
  }
}
