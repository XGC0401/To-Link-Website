import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type EmailCodeAction = "send" | "verify";

interface EmailCodeRequestBody {
  action?: EmailCodeAction;
  email?: string;
  code?: string;
}

interface SendCodeResult {
  developmentCode?: string;
}

interface EmailCodeEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function getEmailCodeStore() {
  const g = globalThis as typeof globalThis & {
    __toLinkEmailCodeStore?: Map<string, EmailCodeEntry>;
  };

  if (!g.__toLinkEmailCodeStore) {
    g.__toLinkEmailCodeStore = new Map<string, EmailCodeEntry>();
  }

  return g.__toLinkEmailCodeStore;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM?.trim();

  if (!host || !portRaw || !user || !pass || !from) {
    return null;
  }

  const port = Number(portRaw);

  if (!Number.isInteger(port) || port <= 0) {
    return null;
  }

  return { host, port, user, pass, from };
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return null;
  }

  return { apiKey, from };
}

function isRenderFreeSmtpPortBlocked(port: number) {
  return process.env.RENDER === "true" && [25, 465, 587].includes(port);
}

function canUseDevelopmentEmailFallback() {
  return process.env.NODE_ENV !== "production";
}

async function sendCodeEmailWithResend(email: string, code: string, apiKey: string, from: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your To-Link verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
    }),
    cache: "no-store",
  });

  if (response.ok) {
    return;
  }

  let message = "Failed to send verification email.";

  try {
    const payload = (await response.json()) as { error?: string; message?: string; name?: string };
    message = payload.message ?? payload.error ?? payload.name ?? message;
  } catch {
    const text = await response.text().catch(() => "");

    if (text.trim()) {
      message = text.trim();
    }
  }

  throw new Error(`Resend error: ${message}`);
}

async function sendCodeEmail(email: string, code: string): Promise<SendCodeResult> {
  const resend = getResendConfig();

  if (resend) {
    await sendCodeEmailWithResend(email, code, resend.apiKey, resend.from);
    return {};
  }

  const smtp = getSmtpConfig();

  if (!smtp) {
    if (canUseDevelopmentEmailFallback()) {
      console.info(`[email-code] SMTP not configured. Development code for ${email}: ${code}`);
      return {
        developmentCode: code,
      };
    }

    throw new Error("Email service is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM.");
  }

  if (isRenderFreeSmtpPortBlocked(smtp.port)) {
    throw new Error(
      "Render free web services cannot send SMTP traffic on ports 25, 465, or 587. Set RESEND_API_KEY and keep EMAIL_FROM as a verified sender address to send verification codes over HTTPS instead.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "Your To-Link verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  });

  return {};
}

export async function POST(request: Request) {
  let body: EmailCodeRequestBody;

  try {
    body = (await request.json()) as EmailCodeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action;
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";

  if (action !== "send" && action !== "verify") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const store = getEmailCodeStore();

  if (action === "send") {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    store.set(email, {
      code,
      expiresAt: Date.now() + EMAIL_CODE_TTL_MS,
      attempts: 0,
    });

    try {
      const result = await sendCodeEmail(email, code);
      return NextResponse.json({
        developmentCode: result.developmentCode,
        success: true,
      });
    } catch (error) {
      store.delete(email);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to send verification email." },
        { status: 500 },
      );
    }
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Verification code must be 6 digits." }, { status: 400 });
  }

  const entry = store.get(email);

  if (!entry) {
    return NextResponse.json({ error: "No verification code found. Please send a new code." }, { status: 400 });
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    return NextResponse.json({ error: "Verification code has expired. Please send a new code." }, { status: 400 });
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    store.delete(email);
    return NextResponse.json({ error: "Too many incorrect attempts. Please send a new code." }, { status: 429 });
  }

  if (entry.code !== code) {
    entry.attempts += 1;
    store.set(email, entry);
    return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
  }

  store.delete(email);
  return NextResponse.json({ success: true });
}
