"use client";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  type ConfirmationResult,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  setPersistence,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  updateProfile,
  verifyPasswordResetCode,
} from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Languages,
  Mail,
  MoonStar,
  Phone,
  SunMedium,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { firebaseSetupHint, getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
  const searchParams = useSearchParams();
  const { language, theme, toggleLanguage, toggleTheme } = useToLink();
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
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingVerifyCode, setSendingVerifyCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const formModeTitle = {
    login: t(language, "auth.login"),
    register: t(language, "auth.register"),
    forgot: t(language, "auth.forgot"),
    reset: t(language, "auth.reset"),
  }[mode];

  function normalizeIdentifier(value: string) {
    const trimmed = value.trim().toLowerCase();

    if (trimmed.includes("@")) {
      return trimmed;
    }

    return trimmed.replace(/[\s()-]/g, "");
  }

  async function resolveEmailFromIdentifier(identifier: string) {
    const normalized = normalizeIdentifier(identifier);

    if (!normalized) {
      return "";
    }

    if (normalized.includes("@")) {
      return normalized;
    }

    const services = getFirebaseServices();

    if (!services) {
      return "";
    }

    const handleDoc = await getDoc(doc(services.db, "userHandles", normalized));

    if (!handleDoc.exists()) {
      return "";
    }

    const data = handleDoc.data();
    return typeof data.email === "string" ? data.email : "";
  }

  function normalizePhoneForAuth(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    const compact = trimmed.replace(/[\s()-]/g, "");

    if (compact.startsWith("+")) {
      return compact;
    }

    if (compact.startsWith("00")) {
      return `+${compact.slice(2)}`;
    }

    return compact;
  }

  async function ensureRecaptchaVerifier() {
    const services = getFirebaseServices();

    if (!services) {
      throw new Error(firebaseSetupHint);
    }

    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(services.auth, "register-phone-recaptcha", {
        size: "invisible",
      });
      await recaptchaVerifierRef.current.render();
    }

    return { services, verifier: recaptchaVerifierRef.current };
  }

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  function getFriendlyAuthError(error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string"
    ) {
      switch (error.code) {
        case "auth/invalid-credential":
          return t(language, "auth.invalidCredential");
        case "auth/invalid-email":
          return t(language, "auth.invalidEmail");
        case "auth/missing-password":
          return t(language, "auth.error.missingPassword");
        case "auth/network-request-failed":
          return t(language, "auth.networkError");
        case "auth/too-many-requests":
          return t(language, "auth.tooManyRequests");
        case "auth/user-disabled":
          return t(language, "auth.accountDisabled");
        case "auth/user-not-found":
          return t(language, "auth.error.userNotFound");
        case "auth/email-already-in-use":
          return t(language, "auth.error.emailInUse");
        case "auth/missing-email":
          return t(language, "auth.error.missingEmail");
        case "auth/weak-password":
          return t(language, "auth.error.weakPassword");
        default:
          break;
      }
    }

    return error instanceof Error ? error.message : t(language, "auth.error.failed");;
  }

  return (
    <div className="flex min-h-dvh w-full overflow-y-auto bg-background px-3 py-3 md:px-5 md:py-5">
      <div className="relative grid w-full flex-1 overflow-hidden rounded-[30px] border border-white/40 bg-white/30 shadow-[0_30px_80px_rgba(146,72,8,0.16)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,205,161,0.95),transparent_34%),linear-gradient(135deg,#fff7f0_0%,#ffe8d6_58%,#ffd3b2_100%)]" />
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(243,107,33,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="relative z-10 max-w-xl space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-sm font-semibold text-accent-strong shadow-[0_10px_24px_rgba(243,107,33,0.18)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-base font-black tracking-wide text-white ring-4 ring-accent/20">
                TL
              </span>
              <span className="text-base font-bold tracking-[0.08em]">{t(language, "brand")}</span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-lg font-display text-5xl font-semibold leading-[1.05] text-foreground">
                {t(language, "auth.hero.headline")}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted">{t(language, "auth.tagline")}</p>
            </div>
          </div>

          <div className="relative z-10 grid gap-4 md:grid-cols-3">
            {[
              t(language, "auth.hero.card1"),
              t(language, "auth.hero.card2"),
              t(language, "auth.hero.card3"),
            ].map((item) => (
              <div key={item} className="app-panel rounded-[28px] border px-4 py-4 text-sm text-muted">
                <p className="font-semibold text-foreground">{item}</p>
                <p className="mt-2 leading-6">
                  {t(language, "auth.hero.cardDesc")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-3 md:p-6">
          <div className="app-panel app-panel-strong relative w-full max-w-xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[28px] border px-5 py-6 shadow-[0_24px_60px_rgba(116,57,10,0.16)] md:max-h-[calc(100dvh-2.5rem)] md:px-8 md:py-8">
            {mode === "login" ? (
              <div className="absolute right-4 top-4 flex items-center gap-2 md:right-6 md:top-6">
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-panel-strong px-3 text-xs font-semibold text-foreground transition hover:border-accent/40 hover:text-accent"
                  onClick={toggleLanguage}
                  type="button"
                >
                  <Languages className="h-4 w-4" />
                  {language === "en" ? "EN" : "中文"}
                </button>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-panel-strong text-foreground transition hover:border-accent/40 hover:text-accent"
                  onClick={toggleTheme}
                  type="button"
                >
                  {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                </button>
              </div>
            ) : null}

            <div className="mb-6 space-y-2 pr-20">
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-accent-strong">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-black tracking-wide text-white">
                  TL
                </span>
                {t(language, "brand")}
              </p>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                {formModeTitle}
              </h2>
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

                  const identifier = state.identifier.trim();

                  if (!identifier) {
                    toast.error(t(language, "auth.error.enterIdentifier"));
                    return;
                  }

                  if (!state.password) {
                    toast.error(t(language, "auth.error.enterPassword"));
                    return;
                  }

                  const services = getFirebaseServices();

                  if (!services) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  setLoading(true);

                  try {
                    const email = await resolveEmailFromIdentifier(identifier);

                    if (!email) {
                      toast.error(t(language, "auth.error.notFound"));
                      return;
                    }

                    await setPersistence(
                      services.auth,
                      state.rememberMe ? browserLocalPersistence : browserSessionPersistence,
                    );
                    await signInWithEmailAndPassword(services.auth, email, state.password);
                    toast.success(t(language, "auth.signedIn"));
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
                  const phone = normalizePhoneForAuth(state.phone);

                  if (!email) {
                    toast.error(t(language, "auth.error.enterEmail"));
                    return;
                  }

                  if (!password) {
                    toast.error(t(language, "auth.createPassword"));
                    return;
                  }

                  if (!phone) {
                    toast.error(t(language, "auth.error.verifyPhone"));
                    return;
                  }

                  if (!phone.startsWith("+")) {
                    toast.error(t(language, "auth.phoneFormat"));
                    return;
                  }

                  if (!phoneVerified) {
                    toast.error(t(language, "auth.verifyPhoneFirst"));
                    return;
                  }

                  if (password.length < 6) {
                    toast.error(t(language, "auth.error.weakPassword"));
                    return;
                  }

                  if (password !== confirmPassword) {
                    toast.error(t(language, "auth.passwordMismatch"));
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
                  const normalizedUsername = normalizeIdentifier(state.username);
                  const normalizedPhone = normalizeIdentifier(phone);

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

                    await setDoc(doc(services.db, "userProfiles", credential.user.uid), {
                      uid: credential.user.uid,
                      email,
                      firstName: state.firstName.trim(),
                      lastName: state.lastName.trim(),
                      username: state.username.trim(),
                      phone: state.phone.trim(),
                      country: state.country.trim(),
                      currentState: state.currentState,
                      jobTitle: state.jobTitle.trim(),
                      createdAt: new Date().toISOString(),
                    });

                    if (normalizedUsername) {
                      await setDoc(doc(services.db, "userHandles", normalizedUsername), {
                        email,
                        type: "username",
                        uid: credential.user.uid,
                      });
                    }

                    if (normalizedPhone) {
                      await setDoc(doc(services.db, "userHandles", normalizedPhone), {
                        email,
                        type: "phone",
                        uid: credential.user.uid,
                      });
                    }

                    toast.success(t(language, "auth.accountCreated"));
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
                    toast.error(t(language, "auth.enterForgotEmail"));
                    return;
                  }

                  const services = getFirebaseServices();

                  if (!services) {
                    toast.error(firebaseSetupHint);
                    return;
                  }

                  setLoading(true);

                  try {
                    await sendPasswordResetEmail(services.auth, email, {
                      url:
                        typeof window !== "undefined"
                          ? `${window.location.origin}/reset-password`
                          : "/reset-password",
                      handleCodeInApp: true,
                    });
                    toast.success(t(language, "auth.resetSent"));
                    router.push("/");
                  } catch (error) {
                    if (
                      error &&
                      typeof error === "object" &&
                      "code" in error &&
                      error.code === "auth/user-not-found"
                    ) {
                      toast.error(t(language, "auth.emailNotRegistered"));
                    } else {
                      toast.error(getFriendlyAuthError(error));
                    }
                  } finally {
                    setLoading(false);
                  }

                  return;
                }

                if (!isFirebaseConfigured) {
                  toast.error(firebaseSetupHint);
                  return;
                }

                if (!state.newPassword) {
                  toast.error(t(language, "auth.error.enterNewPassword"));
                  return;
                }

                if (state.newPassword.length < 6) {
                  toast.error(t(language, "auth.error.weakPassword"));
                  return;
                }

                if (state.newPassword !== state.confirmPassword) {
                  toast.error(t(language, "auth.passwordMismatch"));
                  return;
                }

                const services = getFirebaseServices();

                if (!services) {
                  toast.error(firebaseSetupHint);
                  return;
                }

                const code = searchParams.get("oobCode")?.trim();

                if (!code) {
                  toast.error(t(language, "auth.error.invalidLink"));
                  return;
                }

                setLoading(true);

                try {
                  const emailFromCode = await verifyPasswordResetCode(services.auth, code);
                  const enteredEmail = state.email.trim().toLowerCase();

                  if (enteredEmail && enteredEmail !== emailFromCode.toLowerCase()) {
                    toast.error(t(language, "auth.error.linkMismatch"));
                    return;
                  }

                  await confirmPasswordReset(services.auth, code, state.newPassword);
                  toast.success(t(language, "auth.passwordUpdated"));
                  router.push("/");
                } catch (error) {
                  toast.error(getFriendlyAuthError(error));
                } finally {
                  setLoading(false);
                }
              }}
            >
              {mode === "login" ? (
                <>
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label={t(language, "auth.identifier")}
                    onChange={(value) => setState((current) => ({ ...current, identifier: value }))}
                    placeholder={t(language, "auth.identifier")}
                    value={state.identifier}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label={t(language, "auth.passwordLabel")}
                    allowPasswordToggle
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
                <div className="grid gap-4">
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label={t(language, "auth.firstName")}
                    onChange={(value) => setState((current) => ({ ...current, firstName: value }))}
                    value={state.firstName}
                  />
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label={t(language, "auth.lastName")}
                    onChange={(value) => setState((current) => ({ ...current, lastName: value }))}
                    value={state.lastName}
                  />
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label={t(language, "auth.usernameLabel")}
                    onChange={(value) => setState((current) => ({ ...current, username: value }))}
                    value={state.username}
                  />
                  <InputField
                    icon={<Mail className="h-4 w-4" />}
                    label={t(language, "auth.emailLabel")}
                    onChange={(value) => setState((current) => ({ ...current, email: value }))}
                    placeholder="resident@email.com"
                    type="email"
                    value={state.email}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label={t(language, "auth.passwordLabel")}
                    allowPasswordToggle
                    onChange={(value) => setState((current) => ({ ...current, password: value }))}
                    placeholder={t(language, "auth.atLeast6")}
                    type="password"
                    value={state.password}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label={t(language, "auth.confirmPassword")}
                    allowPasswordToggle
                    onChange={(value) =>
                      setState((current) => ({ ...current, confirmPassword: value }))
                    }
                    placeholder={t(language, "auth.confirmPassword")}
                    type="password"
                    value={state.confirmPassword}
                  />
                  <InputField
                    icon={<Phone className="h-4 w-4" />}
                    label={t(language, "auth.phoneLabel")}
                    onChange={(value) => {
                      setState((current) => ({ ...current, phone: value }));
                      setPhoneVerified(false);
                      setConfirmationResult(null);
                    }}
                    placeholder="+85291234567"
                    value={state.phone}
                  />
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <InputField
                      icon={<KeyRound className="h-4 w-4" />}
                      label={t(language, "auth.verificationCode")}
                      onChange={setVerificationCode}
                      placeholder={t(language, "auth.verificationCode")}
                      value={verificationCode}
                    />
                    <button
                      className={cn(
                        "self-end rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground transition hover:border-accent/40 hover:text-accent",
                        sendingVerifyCode && "cursor-not-allowed opacity-60",
                      )}
                      disabled={sendingVerifyCode}
                      onClick={async () => { // send verify
                        if (!isFirebaseConfigured) {
                          toast.error(firebaseSetupHint);
                          return;
                        }

                        const normalizedPhone = normalizePhoneForAuth(state.phone);

                        if (!normalizedPhone || !normalizedPhone.startsWith("+")) {
                          toast.error("Enter a valid international phone number, for example +85291234567.");
                          return;
                        }

                        setSendingVerifyCode(true);

                        try {
                          const { services, verifier } = await ensureRecaptchaVerifier();
                          const result = await signInWithPhoneNumber(
                            services.auth,
                            normalizedPhone,
                            verifier,
                          );
                          setConfirmationResult(result);
                          setPhoneVerified(false);
                          toast.success("Verification code sent to your phone.");
                        } catch (error) {
                          recaptchaVerifierRef.current?.clear();
                          recaptchaVerifierRef.current = null;
                          toast.error(getFriendlyAuthError(error));
                        } finally {
                          setSendingVerifyCode(false);
                        }
                      }}
                      type="button"
                    >
                      {sendingVerifyCode ? t(language, "auth.sending") : t(language, "auth.sendVerifyCode")}
                    </button>
                  </div>
                  <button
                    className={cn(
                      "rounded-full border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground transition hover:border-accent/40 hover:text-accent",
                      verifyingCode && "cursor-not-allowed opacity-60",
                    )}
                    disabled={verifyingCode}
                    onClick={async () => {
                      if (!confirmationResult) {
                        toast.error("Please send a verification code first.");
                        return;
                      }

                      if (!verificationCode.trim()) {
                        toast.error("Enter the verification code from SMS.");
                        return;
                      }

                      setVerifyingCode(true);

                      try {
                        const credential = await confirmationResult.confirm(verificationCode.trim());
                        await deleteUser(credential.user);
                        setPhoneVerified(true);
                        setConfirmationResult(null);
                        toast.success("Phone number verified successfully.");
                      } catch (error) {
                        setPhoneVerified(false);
                        toast.error(getFriendlyAuthError(error));
                      } finally {
                        setVerifyingCode(false);
                      }
                    }}
                    type="button"
                  >
                    {verifyingCode ? t(language, "auth.verifying") : t(language, "auth.verifyCode")}
                  </button>
                  <p
                    className={cn(
                      "text-xs",
                      phoneVerified ? "text-success" : "text-muted",
                    )}
                  >
                    {phoneVerified
                      ? "Phone verified. You can now create your account."
                      : "Phone not verified yet."}
                  </p>
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label={t(language, "auth.hkid")}
                    onChange={(value) => setState((current) => ({ ...current, hkid: value }))}
                    value={state.hkid}
                  />
                  <InputField
                    icon={<UserRound className="h-4 w-4" />}
                    label={t(language, "auth.countryLabel")}
                    onChange={(value) => setState((current) => ({ ...current, country: value }))}
                    value={state.country}
                  />
                  <SelectField
                    label={t(language, "auth.currentStateLabel")}
                    onChange={(value) => setState((current) => ({ ...current, currentState: value }))}
                    options={[
                      { label: t(language, "auth.state.worker"), value: "worker" },
                      { label: t(language, "auth.state.employee"), value: "employee" },
                      { label: t(language, "auth.state.jobless"), value: "jobless" },
                      { label: t(language, "auth.state.student"), value: "student" },
                    ]}
                    value={state.currentState}
                  />
                  {state.currentState === "worker" || state.currentState === "employee" ? (
                    <div>
                      <InputField
                        icon={<UserRound className="h-4 w-4" />}
                        label={t(language, "auth.jobTitleLabel")}
                        onChange={(value) => setState((current) => ({ ...current, jobTitle: value }))}
                        value={state.jobTitle}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}


                  {mode === "register" ? <div id="register-phone-recaptcha" /> : null}
              {mode === "forgot" ? (
                <InputField
                  icon={<Mail className="h-4 w-4" />}
                  label={t(language, "auth.registeredEmail")}
                  onChange={(value) => setState((current) => ({ ...current, email: value }))}
                  type="email"
                  value={state.email}
                />
              ) : null}

              {mode === "reset" ? (
                <>
                  <InputField
                    icon={<Mail className="h-4 w-4" />}
                    label={t(language, "auth.registeredEmail")}
                    onChange={(value) => setState((current) => ({ ...current, email: value }))}
                    type="email"
                    value={state.email}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label={t(language, "auth.newPassword")}
                    allowPasswordToggle
                    onChange={(value) => setState((current) => ({ ...current, newPassword: value }))}
                    type="password"
                    value={state.newPassword}
                  />
                  <InputField
                    icon={<KeyRound className="h-4 w-4" />}
                    label={t(language, "auth.confirmNewPassword")}
                    allowPasswordToggle
                    onChange={(value) =>
                      setState((current) => ({ ...current, confirmPassword: value }))
                    }
                    type="password"
                    value={state.confirmPassword}
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
                {loading ? t(language, "auth.working") : formModeTitle}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
              {mode !== "forgot" && mode !== "reset" ? (
                <Link
                  className="inline-flex items-center rounded-full border border-border bg-panel px-4 py-2 font-semibold transition hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
                  href="/forgot-password"
                >
                  {t(language, "auth.forgot")}
                </Link>
              ) : null}
              {mode !== "register" ? (
                <Link
                  className="inline-flex items-center rounded-full border border-border bg-panel px-4 py-2 font-semibold transition hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
                  href="/register"
                >
                  {t(language, "auth.register")}
                </Link>
              ) : null}
              {mode !== "login" ? (
                <Link
                  className="inline-flex items-center rounded-full border border-border bg-panel px-4 py-2 font-semibold transition hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
                  href="/"
                >
                  {t(language, "auth.login")}
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InputField({
  allowPasswordToggle,
  icon,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  allowPasswordToggle?: boolean;
  icon: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  const [showValue, setShowValue] = useState(false);
  const shouldToggle = allowPasswordToggle && type === "password";

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="app-input flex items-center gap-3 rounded-[22px] px-4 py-3.5">
        <span className="text-muted">{icon}</span>
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-[11px] placeholder:leading-5 placeholder:text-muted md:placeholder:text-[10px] lg:placeholder:text-xs"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={shouldToggle && showValue ? "text" : type}
          value={value}
        />
        {shouldToggle ? (
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-accent-soft hover:text-accent"
            onClick={() => setShowValue((current) => !current)}
            type="button"
          >
            {showValue ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        ) : null}
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