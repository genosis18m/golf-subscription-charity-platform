import { formatCurrency } from '@/lib/utils';

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFrom = process.env.RESEND_FROM_EMAIL ?? 'GOLF-Fego <onboarding@resend.dev>';

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!resendApiKey) {
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: defaultFrom,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${body}`);
  }
}

export async function sendWelcomeEmail({
  to,
  fullName,
}: {
  to: string;
  fullName?: string | null;
}) {
  const name = fullName?.trim() || 'Member';

  await sendEmail({
    to,
    subject: 'Welcome to GOLF-Fego',
    text: `Hi ${name}, welcome to GOLF-Fego. Your account is confirmed and your clubhouse is ready.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f1f14">
      <h1 style="margin:0 0 16px;color:#0f1f14">Welcome to GOLF-Fego</h1>
      <p>Hi ${name},</p>
      <p>Your account is confirmed and your clubhouse is ready.</p>
      <p>You can now complete your profile, choose your charity, and enter your first monthly draw.</p>
    </div>`,
  });
}

export async function sendSubscriptionEmail({
  to,
  fullName,
  planLabel,
}: {
  to: string;
  fullName?: string | null;
  planLabel: string;
}) {
  const name = fullName?.trim() || 'Member';

  await sendEmail({
    to,
    subject: `${planLabel} membership confirmed`,
    text: `Hi ${name}, your ${planLabel} membership is now active on GOLF-Fego.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f1f14">
      <h1 style="margin:0 0 16px;color:#0f1f14">${planLabel} membership confirmed</h1>
      <p>Hi ${name},</p>
      <p>Your ${planLabel.toLowerCase()} membership is now active on GOLF-Fego.</p>
      <p>You can head back to your dashboard to track scores, manage your charity contribution, and follow upcoming draws.</p>
    </div>`,
  });
}

export async function sendWinnerNotificationEmail({
  to,
  fullName,
  drawTitle,
  matchTier,
  prizeAmount,
}: {
  to: string;
  fullName?: string | null;
  drawTitle: string;
  matchTier: 'five_match' | 'four_match' | 'three_match';
  prizeAmount: number;
}) {
  const name = fullName?.trim() || 'Member';
  const tierLabel =
    matchTier === 'five_match' ? '5-match' : matchTier === 'four_match' ? '4-match' : '3-match';
  const amount = formatCurrency(prizeAmount);

  await sendEmail({
    to,
    subject: `Draw result: ${tierLabel} winner`,
    text: `Hi ${name}, you have a ${tierLabel} result in ${drawTitle}. Current prize amount: ${amount}.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f1f14">
      <h1 style="margin:0 0 16px;color:#0f1f14">You have a winning result</h1>
      <p>Hi ${name},</p>
      <p>You recorded a <strong>${tierLabel}</strong> result in <strong>${drawTitle}</strong>.</p>
      <p>Current prize amount: <strong>${amount}</strong>.</p>
      <p>Log in to review the result and complete any required next steps.</p>
    </div>`,
  });
}
