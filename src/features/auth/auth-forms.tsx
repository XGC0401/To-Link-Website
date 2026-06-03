"use client";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, KeyRound, Mail, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { APP_NAME, APP_TAGLINE } from "@/lib/app-config";
import { firebaseSetupHint, getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";

type AuthMode = "login" | "register" | "forgot" | "reset";

interface AuthFormState {
  identifier: string;
  password: string;
  confirmPassword: string;
  newPassword: string;
  rememberMe: boolean;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  hkid: string;
  country: string;
  currentState: "worker" | "employee" | "jobless" | "student";
  jobTitle: string;
}

export function AuthForms({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { language } = useToLink();
  const [state, setState] = useState<AuthFormState>({
    identifier: "",
    password: "",
    confirmPassword: "",
    newPassword: "",
    rememberMe: true,
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    hkid: "",
    country: "Hong Kong",
    currentState: "employee",
    jobTitle: "",
  });
  const [loading, setLoading] = useState(false);

  const formModeTitle = {
    login: t(language, "auth.login"),
    register: t(language, "auth.register"),
    forgot: t(language, "auth.forgot"),
    reset: t(language, "auth.reset"),
  }[mode];

  function getFriendlyAuthError(error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string"
    ) {
      switch (error.code) {
        case "auth/invalid-credential":
          return "Incorrect email or password.";
        case "auth/invalid-email":
          return "Enter a valid email address.";
        case "auth/missing-password":
          return "Enter your password to continue.";
        case "auth/network-request-failed":
          return "Network error while contacting Firebase Auth.";
        case "auth/too-many-requests":
          return "Too many attempts. Please wait a moment and try again.";
        case "auth/user-disabled":
          return "This account has been disabled.";
        case "auth/user-not-found":
          return "No account exists for that email address.";
        case "auth/email-already-in-use":
          return "An account already exists for that email address.";
        case "auth/missing-email":
          return "Enter your email address to continue.";
        case "auth/weak-password":
          return "Password must be at least 6 characters long.";
        default:
          break;
      }
    }

    return error instanceof Error ? error.message : "Authentication failed.";
  }

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-background px-4 py-5 md:px-6">
      <div className="relative grid w-full flex-1 overflow-hidden rounded-[36px] border border-white/40 bg-white/30 shadow-[0_30px_80px_rgba(146,72,8,0.16)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,205,161,0.95),transparent_34%),linear-gradient(135deg,#fff7f0_0%,#ffe8d6_58%,#ffd3b2_100%)]" />
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(243,107,33,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="relative z-10 max-w-xl space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-accent-strong">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
                TL
              </span>
              {APP_NAME}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-lg font-display text-5xl font-semibold leading-[1.05] text-foreground">
                A polished neighborhood platform that helps residents connect and act.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted">{APP_TAGLINE}</p>
            </div>
          </div>

          <div className="relative z-10 grid gap-4 md:grid-cols-3">
            {[
              "Community updates",
              "Quest collaboration",
              "Building services",
            ].map((item) => (
              <div key={item} className="app-panel rounded-[28px] border px-4 py-4 text-sm text-muted">
                <p className="font-semibold text-foreground">{item}</p>
                <p className="mt-2 leading-6">
                  Designed to stay elegant, fast, and modular as the platform grows.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 md:p-8">
          <div className="app-panel app-panel-strong w-full max-w-xl rounded-[32px] border px-6 py-7 shadow-[0_24px_60px_rgba(116,57,10,0.16)] md:px-8 md:py-8">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
                {APP_NAME}
              </p>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                {formModeTitle}
              </h2>
              <p className="text-sm leading-6 text-muted">{t(language, "auth.demoNotice")}</p>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();

                if (mode === "login") {
                  if (!isFirebaseConfigured) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  const email = state.identifier.trim().toLowerCase();

                  if (!email) {
                    toast.error("Enter your email address to sign in.");
                    return;
                  }

                  if (!email.includes("@")) {
                    toast.error("Firebase login is currently enabled for email addresses only.");
                    return;
                  }

                  if (!state.password) {
                    toast.error("Enter your password to sign in.");
                    return;
                  }

                  const services = getFirebaseServices();

                  if (!services) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  setLoading(true);

                  try {
                    await setPersistence(
                      services.auth,
                      state.rememberMe ? browserLocalPersistence : browserSessionPersistence,
                    );
                    await signInWithEmailAndPassword(services.auth, email, state.password);
                    toast.success("Signed in successfully.");
                    router.push("/home");
                  } catch (error) {
                    toast.error(getFriendlyAuthError(error));
                  } finally {
                    setLoading(false);
                  }

                  return;
                }

                if (mode === "register") {
                  if (!isFirebaseConfigured) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  const email = state.email.trim().toLowerCase();
                  const password = state.password;
                  const confirmPassword = state.confirmPassword;

                  if (!email) {
                    toast.error("Enter your email address to create an account.");
                    return;
                  }

                  if (!password) {
                    toast.error("Create a password to register your account.");
                    return;
                  }

                  if (password.length < 6) {
                    toast.error("Password must be at least 6 characters long.");
                    return;
                  }

                  if (password !== confirmPassword) {
                    toast.error("Password confirmation does not match.");
                    return;
                  }

                  const services = getFirebaseServices();

                  if (!services) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  const displayName = [state.firstName.trim(), state.lastName.trim()]
                    .filter(Boolean)
                    .join(" ") || state.username.trim();

                  setLoading(true);

                  try {
                    const credential = await createUserWithEmailAndPassword(
                      services.auth,
                      email,
                      password,
                    );

                    if (displayName) {
                      await updateProfile(credential.user, { displayName });
                    }

                    toast.success("Account created successfully.");
                    router.push("/home");
                  } catch (error) {
                    toast.error(getFriendlyAuthError(error));
                  } finally {
                    setLoading(false);
                  }

                  return;
                }

                if (mode === "forgot") {
                  if (!isFirebaseConfigured) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  const email = state.email.trim().toLowerCase();

                  if (!email) {
                    toast.error("Enter the email address for your account.");
                    return;
                  }

                  const services = getFirebaseServices();

                  if (!services) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  setLoading(true);

                  try {
                    await sendPasswordResetEmail(services.auth, email);
                    toast.success("Password reset email sent.");
                    router.push("/");
                  } catch (error) {
                    toast.error(getFriendlyAuthError(error));
                  } finally {
                    setLoading(false);
                  }

                  return;
                }

                toast.info("Use the password reset link sent by email to complete a secure password change.");
              }}
            >
              {mode === "login" ? (
                <>
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label="Email"
                    onChange={(value) => setState((current) => ({ ...current, identifier: value }))}
                    placeholder="resident@email.com"
                    value={state.identifier}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label="Password"
                    onChange={(value) => setState((current) => ({ ...current, password: value }))}
                    placeholder="••••••••"
                    type="password"
                    value={state.password}
                  />
                  <label className="flex items-center gap-3 text-sm text-muted">
                    <input
                      checked={state.rememberMe}
                      className="h-4 w-4 rounded border-border text-accent"
                      onChange={(event) =>
                        setState((current) => ({ ...current, rememberMe: event.target.checked }))
                      }
                      type="checkbox"
                    />
                    {t(language, "auth.remember")}
                  </label>
                </>
              ) : null}

              {mode === "register" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label="First Name"
                    onChange={(value) => setState((current) => ({ ...current, firstName: value }))}
                    value={state.firstName}
                  />
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label="Last Name"
                    onChange={(value) => setState((current) => ({ ...current, lastName: value }))}
                    value={state.lastName}
                  />
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label="Username"
                    onChange={(value) => setState((current) => ({ ...current, username: value }))}
                    value={state.username}
                  />
                  <InputField
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    onChange={(value) => setState((current) => ({ ...current, email: value }))}
                    placeholder="resident@email.com"
                    type="email"
                    value={state.email}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label="Password"
                    onChange={(value) => setState((current) => ({ ...current, password: value }))}
                    placeholder="At least 6 characters"
                    type="password"
                    value={state.password}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label="Confirm Password"
                    onChange={(value) =>
                      setState((current) => ({ ...current, confirmPassword: value }))
                    }
                    placeholder="Re-enter your password"
                    type="password"
                    value={state.confirmPassword}
                  />
                  <InputField
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone Number"
                    onChange={(value) => setState((current) => ({ ...current, phone: value }))}
                    value={state.phone}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label="HKID / Personal ID"
                    onChange={(value) => setState((current) => ({ ...current, hkid: value }))}
                    value={state.hkid}
                  />
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label="Country"
                    onChange={(value) => setState((current) => ({ ...current, country: value }))}
                    value={state.country}
                  />
                  <SelectField
                    label="Current State"
                    onChange={(value) => setState((current) => ({ ...current, currentState: value }))}
                    options={[
                      { label: "Worker", value: "worker" },
                      { label: "Employee", value: "employee" },
                      { label: "Jobless", value: "jobless" },
                      { label: "Student", value: "student" },
                    ]}
                    value={state.currentState}
                  />
                  {state.currentState === "worker" || state.currentState === "employee" ? (
                    <div className="md:col-span-2">
                      <InputField
                        icon={<UserRound className="h-4 w-4" />}
                        label="Job Title"
                        onChange={(value) => setState((current) => ({ ...current, jobTitle: value }))}
                        value={state.jobTitle}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {mode === "forgot" ? (
                <InputField
                  icon={<Mail className="h-4 w-4" />}
                  label="Registered Email"
                  onChange={(value) => setState((current) => ({ ...current, email: value }))}
                  type="email"
                  value={state.email}
                />
              ) : null}

              {mode === "reset" ? (
                <>
                  <InputField
                    icon={<Mail className="h-4 w-4" />}
                    label="Registered Email"
                    onChange={(value) => setState((current) => ({ ...current, email: value }))}
                    type="email"
                    value={state.email}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label="New Password"
                    onChange={(value) => setState((current) => ({ ...current, newPassword: value }))}
                    type="password"
                    value={state.newPassword}
                  />
                </>
              ) : null}

              <button
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-strong",
                  loading && "cursor-not-allowed opacity-70",
                )}
                disabled={loading}
                type="submit"
              >
                {loading ? "Working..." : formModeTitle}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted">
              {mode !== "forgot" && mode !== "reset" ? (
                <Link className="hover:text-accent" href="/forgot-password">
                  {t(language, "auth.forgot")}
                </Link>
              ) : null}
              {mode !== "register" ? (
                <Link className="hover:text-accent" href="/register">
                  {t(language, "auth.register")}
                </Link>
              ) : null}
              {mode !== "login" ? (
                <Link className="hover:text-accent" href="/">
                  {t(language, "auth.login")}
                </Link>
              ) : null}
            </div>

            <p className="mt-6 text-xs leading-6 text-muted">
              Sensitive identity data should be encrypted server-side and displayed as masked values
              once Firebase-backed profile storage is connected.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="app-input flex items-center gap-3 rounded-[22px] px-4 py-3.5">
        <span className="text-muted">{icon}</span>
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: "worker" | "employee" | "jobless" | "student") => void;
  options: Array<{ label: string; value: "worker" | "employee" | "jobless" | "student" }>;
  value: "worker" | "employee" | "jobless" | "student";
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        className="app-input w-full rounded-[22px] px-4 py-3.5 text-sm"
        onChange={(event) => onChange(event.target.value as typeof value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}