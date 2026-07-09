import { NextResponse } from "next/server";
import { firebaseAdminSetupHint, getFirebaseAdminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

interface ResetPasswordRequestBody {
  email?: string;
  newPassword?: string;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ResetPasswordRequestBody | null;
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!email) {
    return NextResponse.json({ error: "Please enter your registered email." }, { status: 400 });
  }

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const adminAuth = getFirebaseAdminAuth();

  if (!adminAuth) {
    return NextResponse.json({ error: firebaseAdminSetupHint }, { status: 500 });
  }

  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(user.uid, { password: newPassword });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string" &&
      error.code === "auth/user-not-found"
    ) {
      return NextResponse.json({ error: "No account exists for that email." }, { status: 404 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reset the password.",
      },
      { status: 500 },
    );
  }
}