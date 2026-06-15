"use client";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  updateProfile,
  verifyPasswordResetCode,
} from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Languages,
  Mail,
  MoonStar,
  SunMedium,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { firebaseSetupHint, getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase";
import { t } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useToLink } from "@/lib/app-state";
import { Modal } from "@/components/ui/modal";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COUNTRY_CODES = [
  { code: "+93", label: "Afghanistan (+93)" },
  { code: "+355", label: "Albania (+355)" },
  { code: "+213", label: "Algeria (+213)" },
  { code: "+376", label: "Andorra (+376)" },
  { code: "+244", label: "Angola (+244)" },
  { code: "+54", label: "Argentina (+54)" },
  { code: "+374", label: "Armenia (+374)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+994", label: "Azerbaijan (+994)" },
  { code: "+973", label: "Bahrain (+973)" },
  { code: "+880", label: "Bangladesh (+880)" },
  { code: "+375", label: "Belarus (+375)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+501", label: "Belize (+501)" },
  { code: "+229", label: "Benin (+229)" },
  { code: "+975", label: "Bhutan (+975)" },
  { code: "+591", label: "Bolivia (+591)" },
  { code: "+387", label: "Bosnia and Herzegovina (+387)" },
  { code: "+267", label: "Botswana (+267)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+673", label: "Brunei (+673)" },
  { code: "+359", label: "Bulgaria (+359)" },
  { code: "+226", label: "Burkina Faso (+226)" },
  { code: "+257", label: "Burundi (+257)" },
  { code: "+855", label: "Cambodia (+855)" },
  { code: "+237", label: "Cameroon (+237)" },
  { code: "+1", label: "Canada (+1)" },
  { code: "+238", label: "Cape Verde (+238)" },
  { code: "+236", label: "Central African Republic (+236)" },
  { code: "+235", label: "Chad (+235)" },
  { code: "+56", label: "Chile (+56)" },
  { code: "+86", label: "China (+86)" },
  { code: "+57", label: "Colombia (+57)" },
  { code: "+269", label: "Comoros (+269)" },
  { code: "+243", label: "Congo (DRC) (+243)" },
  { code: "+242", label: "Congo (Republic) (+242)" },
  { code: "+506", label: "Costa Rica (+506)" },
  { code: "+385", label: "Croatia (+385)" },
  { code: "+53", label: "Cuba (+53)" },
  { code: "+357", label: "Cyprus (+357)" },
  { code: "+420", label: "Czech Republic (+420)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+253", label: "Djibouti (+253)" },
  { code: "+1", label: "Dominican Republic (+1)" },
  { code: "+593", label: "Ecuador (+593)" },
  { code: "+20", label: "Egypt (+20)" },
  { code: "+503", label: "El Salvador (+503)" },
  { code: "+240", label: "Equatorial Guinea (+240)" },
  { code: "+291", label: "Eritrea (+291)" },
  { code: "+372", label: "Estonia (+372)" },
  { code: "+251", label: "Ethiopia (+251)" },
  { code: "+679", label: "Fiji (+679)" },
  { code: "+358", label: "Finland (+358)" },
  { code: "+33", label: "France (+33)" },
  { code: "+241", label: "Gabon (+241)" },
  { code: "+220", label: "Gambia (+220)" },
  { code: "+995", label: "Georgia (+995)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+233", label: "Ghana (+233)" },
  { code: "+30", label: "Greece (+30)" },
  { code: "+502", label: "Guatemala (+502)" },
  { code: "+224", label: "Guinea (+224)" },
  { code: "+245", label: "Guinea-Bissau (+245)" },
  { code: "+592", label: "Guyana (+592)" },
  { code: "+509", label: "Haiti (+509)" },
  { code: "+504", label: "Honduras (+504)" },
  { code: "+852", label: "Hong Kong (+852)" },
  { code: "+36", label: "Hungary (+36)" },
  { code: "+354", label: "Iceland (+354)" },
  { code: "+91", label: "India (+91)" },
  { code: "+62", label: "Indonesia (+62)" },
  { code: "+98", label: "Iran (+98)" },
  { code: "+964", label: "Iraq (+964)" },
  { code: "+353", label: "Ireland (+353)" },
  { code: "+972", label: "Israel (+972)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+962", label: "Jordan (+962)" },
  { code: "+7", label: "Kazakhstan (+7)" },
  { code: "+254", label: "Kenya (+254)" },
  { code: "+965", label: "Kuwait (+965)" },
  { code: "+996", label: "Kyrgyzstan (+996)" },
  { code: "+856", label: "Laos (+856)" },
  { code: "+371", label: "Latvia (+371)" },
  { code: "+961", label: "Lebanon (+961)" },
  { code: "+266", label: "Lesotho (+266)" },
  { code: "+231", label: "Liberia (+231)" },
  { code: "+218", label: "Libya (+218)" },
  { code: "+423", label: "Liechtenstein (+423)" },
  { code: "+370", label: "Lithuania (+370)" },
  { code: "+352", label: "Luxembourg (+352)" },
  { code: "+853", label: "Macao (+853)" },
  { code: "+389", label: "North Macedonia (+389)" },
  { code: "+261", label: "Madagascar (+261)" },
  { code: "+265", label: "Malawi (+265)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+960", label: "Maldives (+960)" },
  { code: "+223", label: "Mali (+223)" },
  { code: "+356", label: "Malta (+356)" },
  { code: "+222", label: "Mauritania (+222)" },
  { code: "+230", label: "Mauritius (+230)" },
  { code: "+52", label: "Mexico (+52)" },
  { code: "+373", label: "Moldova (+373)" },
  { code: "+377", label: "Monaco (+377)" },
  { code: "+976", label: "Mongolia (+976)" },
  { code: "+382", label: "Montenegro (+382)" },
  { code: "+212", label: "Morocco (+212)" },
  { code: "+258", label: "Mozambique (+258)" },
  { code: "+95", label: "Myanmar (+95)" },
  { code: "+264", label: "Namibia (+264)" },
  { code: "+977", label: "Nepal (+977)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+505", label: "Nicaragua (+505)" },
  { code: "+227", label: "Niger (+227)" },
  { code: "+234", label: "Nigeria (+234)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+968", label: "Oman (+968)" },
  { code: "+92", label: "Pakistan (+92)" },
  { code: "+970", label: "Palestine (+970)" },
  { code: "+507", label: "Panama (+507)" },
  { code: "+675", label: "Papua New Guinea (+675)" },
  { code: "+595", label: "Paraguay (+595)" },
  { code: "+51", label: "Peru (+51)" },
  { code: "+63", label: "Philippines (+63)" },
  { code: "+48", label: "Poland (+48)" },
  { code: "+351", label: "Portugal (+351)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+40", label: "Romania (+40)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+250", label: "Rwanda (+250)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+221", label: "Senegal (+221)" },
  { code: "+381", label: "Serbia (+381)" },
  { code: "+248", label: "Seychelles (+248)" },
  { code: "+232", label: "Sierra Leone (+232)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+421", label: "Slovakia (+421)" },
  { code: "+386", label: "Slovenia (+386)" },
  { code: "+252", label: "Somalia (+252)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+82", label: "South Korea (+82)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+94", label: "Sri Lanka (+94)" },
  { code: "+249", label: "Sudan (+249)" },
  { code: "+597", label: "Suriname (+597)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+963", label: "Syria (+963)" },
  { code: "+886", label: "Taiwan (+886)" },
  { code: "+992", label: "Tajikistan (+992)" },
  { code: "+255", label: "Tanzania (+255)" },
  { code: "+66", label: "Thailand (+66)" },
  { code: "+228", label: "Togo (+228)" },
  { code: "+216", label: "Tunisia (+216)" },
  { code: "+90", label: "Turkey (+90)" },
  { code: "+993", label: "Turkmenistan (+993)" },
  { code: "+256", label: "Uganda (+256)" },
  { code: "+380", label: "Ukraine (+380)" },
  { code: "+971", label: "United Arab Emirates (+971)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+1", label: "United States (+1)" },
  { code: "+598", label: "Uruguay (+598)" },
  { code: "+998", label: "Uzbekistan (+998)" },
  { code: "+58", label: "Venezuela (+58)" },
  { code: "+84", label: "Vietnam (+84)" },
  { code: "+967", label: "Yemen (+967)" },
  { code: "+260", label: "Zambia (+260)" },
  { code: "+263", label: "Zimbabwe (+263)" },
];

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
  phoneCountryCode: string;
  hkid: string;
  country: string;
  currentState: "worker" | "employee" | "jobless" | "student";
  jobTitle: string;
  acceptPolicies: boolean;
}

interface CountryCodeOption {
  code: string;
  label: string;
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
    phoneCountryCode: "+852",
    hkid: "",
    country: "Hong Kong",
    currentState: "employee",
    jobTitle: "",
    acceptPolicies: false,
  });
  const [loading, setLoading] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [codeSentToEmail, setCodeSentToEmail] = useState("");
  const [emailCodeVerified, setEmailCodeVerified] = useState(false);
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [verifyingEmailCode, setVerifyingEmailCode] = useState(false);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

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

  function createAvatarLabel(value: string) {
    const parts = value
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
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

  async function sendRegisterEmailCode() {
    const email = state.email.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      toast.error(language === "zh-HK" ? "請先輸入有效的電郵地址。" : "Enter a valid email address first.");
      return;
    }

    setSendingEmailCode(true);

    try {
      const response = await fetch("/api/auth/email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send",
          email,
        }),
      });

      const payload = (await response.json()) as { developmentCode?: string; error?: string };

      if (!response.ok) {
        toast.error(
          payload.error ? translateEmailCodeError(payload.error) : language === "zh-HK" ? "無法發送驗證碼。" : "Unable to send verification code.",
        );
        return;
      }

      setCodeSentToEmail(email);
      setEmailCodeVerified(false);

      if (payload.developmentCode) {
        setEmailVerificationCode(payload.developmentCode);
        toast.success(
          language === "zh-HK"
            ? `開發測試驗證碼：${payload.developmentCode}`
            : `Development code ready: ${payload.developmentCode}`,
        );
        return;
      }

      toast.success(language === "zh-HK" ? "驗證碼已發送，請檢查你的電郵。" : "Verification code sent. Please check your email.");
    } catch {
      toast.error(language === "zh-HK" ? "無法發送驗證碼。" : "Unable to send verification code.");
    } finally {
      setSendingEmailCode(false);
    }
  }

  async function verifyRegisterEmailCode() {
    const email = state.email.trim().toLowerCase();
    const code = emailVerificationCode.trim();

    if (!email || !email.includes("@")) {
      toast.error(language === "zh-HK" ? "請先輸入有效的電郵地址。" : "Enter a valid email address first.");
      return;
    }

    if (!code || code.length !== 6) {
      toast.error(language === "zh-HK" ? "請輸入電郵中的 6 位驗證碼。" : "Enter the 6-digit code from your email.");
      return;
    }

    setVerifyingEmailCode(true);

    try {
      const response = await fetch("/api/auth/email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify",
          email,
          code,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setEmailCodeVerified(false);
        toast.error(payload.error ? translateEmailCodeError(payload.error) : t(language, "auth.verificationFailed"));
        return;
      }

      setEmailCodeVerified(true);
      toast.success(t(language, "auth.emailVerifiedSuccess"));
    } catch {
      setEmailCodeVerified(false);
      toast.error(t(language, "auth.verificationFailed"));
    } finally {
      setVerifyingEmailCode(false);
    }
  }

  function translateEmailCodeError(message: string) {
    switch (message) {
      case "No verification code found. Please send a new code.":
        return t(language, "auth.emailCodeNotFound");
      case "Verification code has expired. Please send a new code.":
        return t(language, "auth.emailCodeExpired");
      case "Too many incorrect attempts. Please send a new code.":
        return t(language, "auth.emailCodeAttemptsExceeded");
      case "Incorrect verification code.":
        return t(language, "auth.emailCodeIncorrect");
      case "Verification code must be 6 digits.":
        return t(language, "auth.emailCodeDigits");
      default:
        return message;
    }
  }

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
          <div
            className={cn(
              "absolute inset-0",
              theme === "light"
                ? "bg-[radial-gradient(circle_at_top_left,rgba(255,205,161,0.95),transparent_34%),linear-gradient(135deg,#fff7f0_0%,#ffe8d6_58%,#ffd3b2_100%)]"
                : "bg-[radial-gradient(circle_at_top_left,rgba(255,185,132,0.22),transparent_34%),linear-gradient(135deg,#1f140c_0%,#362115_56%,#55311e_100%)]",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 opacity-70 [background-size:22px_22px]",
              theme === "light"
                ? "[background-image:radial-gradient(circle,rgba(243,107,33,0.12)_1px,transparent_1px)]"
                : "[background-image:radial-gradient(circle,rgba(255,222,196,0.22)_1px,transparent_1px)]",
            )}
          />
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
            {([
              { title: t(language, "auth.hero.card1"), desc: t(language, "auth.hero.card1Desc") },
              { title: t(language, "auth.hero.card2"), desc: t(language, "auth.hero.card2Desc") },
              { title: t(language, "auth.hero.card3"), desc: t(language, "auth.hero.card3Desc") },
            ] as const).map((item) => (
              <div key={item.title} className="app-panel rounded-[28px] border px-4 py-4 text-sm text-muted">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 leading-6">
                  {item.desc}
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
                  const phone = normalizePhoneForAuth(state.phoneCountryCode + state.phone);

                  if (!email) {
                    toast.error(t(language, "auth.error.enterEmail"));
                    return;
                  }

                  if (!password) {
                    toast.error(t(language, "auth.createPassword"));
                    return;
                  }

                  // Email verification is optional for free public registration

                  if (!phone) {
                    toast.error(t(language, "auth.error.verifyPhone"));
                    return;
                  }

                  if (!phone.startsWith("+")) {
                    toast.error(t(language, "auth.phoneFormat"));
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

                  if (!state.acceptPolicies) {
                    toast.error(
                      language === "zh-HK"
                        ? "請先同意私隱政策及服務條款。"
                        : "Please accept the Privacy Policy and Terms of Service first.",
                    );
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

                    // Determine if this is the admin account
                    const isAdminAccount = email.toLowerCase() === "admin@admin.com";
                    const userRole = isAdminAccount ? "admin" : "resident";

                    const newUserProfile = {
                      id: credential.user.uid,
                      uid: credential.user.uid,
                      email,
                      firstName: state.firstName.trim(),
                      lastName: state.lastName.trim(),
                      name: displayName,
                      username: state.username.trim(),
                      avatar: createAvatarLabel(displayName || state.username.trim() || email),
                      bio: "",
                      phone: (state.phoneCountryCode + state.phone).trim(),
                      country: state.country.trim(),
                      currentState: state.currentState,
                      jobTitle: state.jobTitle.trim(),
                      role: userRole,
                      status: "online",
                      createdAt: new Date().toISOString(),
                    };

                    await setDoc(doc(services.db, "userProfiles", credential.user.uid), newUserProfile);

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

                if (!isFirebaseConfigured) {
                  toast.error(firebaseSetupHint);
                  return;
                }

                // Reset mode: requires a valid Firebase password-reset link code
                const code = searchParams.get("oobCode")?.trim();

                if (!code) {
                  toast.error(t(language, "auth.error.invalidLink"));
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
                    onChange={(value) => {
                      setState((current) => ({ ...current, email: value }));
                    }}
                    placeholder="name@example.com"
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
                  <div className="block space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(language, "auth.phoneLabel")}</span>
                    <div className="flex gap-2">
                      <div className="min-w-[180px]">
                        <CountryCodeCombobox
                          onChange={(value) =>
                            setState((current) => ({ ...current, phoneCountryCode: value }))
                          }
                          options={COUNTRY_CODES}
                          value={state.phoneCountryCode}
                        />
                      </div>
                      <div className="app-input flex flex-1 items-center gap-3 rounded-[22px] px-4 py-3.5">
                        <input
                          className="w-full bg-transparent text-sm outline-none placeholder:text-[11px] placeholder:leading-5 placeholder:text-muted"
                          id="register-phone"
                          inputMode="tel"
                          name="phone"
                          onChange={(event) =>
                            setState((current) => ({ ...current, phone: event.target.value }))
                          }
                          placeholder="91234567"
                          type="tel"
                          value={state.phone}
                        />
                      </div>
                    </div>
                  </div>
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
                  <div className="rounded-[24px] border border-border bg-panel px-4 py-4">
                    <div className="flex items-start gap-3 text-sm leading-6 text-muted">
                      <input
                        checked={state.acceptPolicies}
                        className="mt-1 h-4 w-4 rounded border-border text-accent"
                        id="accept-policies-checkbox"
                        name="acceptPolicies"
                        onChange={(event) =>
                          setState((current) => ({ ...current, acceptPolicies: event.target.checked }))
                        }
                        type="checkbox"
                      />
                      <span>
                        {language === "zh-HK" ? "我已閱讀並接受" : "I accept the "}
                        <button
                          className="font-semibold text-accent underline underline-offset-4"
                          onClick={() => setLegalModal("privacy")}
                          type="button"
                        >
                          {language === "zh-HK" ? "私隱政策" : "Privacy Policy"}
                        </button>
                        {language === "zh-HK" ? "及" : " and the "}
                        <button
                          className="font-semibold text-accent underline underline-offset-4"
                          onClick={() => setLegalModal("terms")}
                          type="button"
                        >
                          {language === "zh-HK" ? "服務條款" : "Terms of Service"}
                        </button>
                        {language === "zh-HK" ? "。" : "."}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

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
                  href="/reset-password"
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

      <Modal
        onClose={() => setLegalModal(null)}
        open={legalModal !== null}
        title={
          legalModal === "privacy"
            ? language === "zh-HK"
              ? "私隱政策"
              : "Privacy Policy"
            : language === "zh-HK"
              ? "服務條款"
              : "Terms of Service"
        }
      >
        <div className="space-y-4 text-sm leading-7 text-muted">
          {legalModal === "privacy" ? (
            <>
              <p>
                {language === "zh-HK"
                  ? "此私隱政策為示範版本，說明平台如何收集、使用及保護住戶的註冊資料、聯絡資訊及互動紀錄。"
                  : "This Privacy Policy is a mock document describing how the platform collects, uses, and protects resident registration data, contact details, and interaction records."}
              </p>
              <p>
                {language === "zh-HK"
                  ? "資料主要用於帳戶登入、社區互動、預約服務及通知推送，平台只會保留營運所需的必要資料。"
                  : "Data is used primarily for account access, community interactions, booking services, and notifications, and the platform keeps only the records required for operations."}
              </p>
            </>
          ) : (
            <>
              <p>
                {language === "zh-HK"
                  ? "此服務條款為示範版本，要求使用者遵守社區守則、尊重其他住戶，並真實填寫帳戶資料。"
                  : "These Terms of Service are a mock version requiring users to follow community rules, respect other residents, and provide accurate account information."}
              </p>
              <p>
                {language === "zh-HK"
                  ? "如出現濫用、垃圾訊息或不當內容，平台可根據管理及審核流程限制功能、發出警告或暫停帳戶。"
                  : "If abuse, spam, or inappropriate content is detected, the platform may restrict features, issue warnings, or suspend the account according to moderation processes."}
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

function normalizeDialCode(value: string) {
  const compact = value.trim().replace(/[^\d+]/g, "");

  if (!compact) {
    return "";
  }

  const noExtraPlus = compact.startsWith("+") ? compact.slice(1) : compact;

  if (!noExtraPlus) {
    return "";
  }

  return `+${noExtraPlus}`;
}

function CountryCodeCombobox({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: CountryCodeOption[];
  value: string;
}) {
  const { language } = useToLink();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = options
    .filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedQuery) ||
        option.code.toLowerCase().includes(normalizedQuery),
    );
  const sortedFiltered = [...filtered].sort((a, b) => a.label.localeCompare(b.label));
  const groupedOptions = sortedFiltered.reduce<Map<string, CountryCodeOption[]>>((groups, option) => {
    const first = option.label.trim().charAt(0).toUpperCase();
    const letter = /^[A-Z]$/.test(first) ? first : "#";
    const bucket = groups.get(letter) ?? [];
    bucket.push(option);
    groups.set(letter, bucket);
    return groups;
  }, new Map());
  const groupKeys = Array.from(groupedOptions.keys()).sort((a, b) => a.localeCompare(b));
  const selectedCode = normalizeDialCode(value);

  function commitCustomCode(raw: string) {
    const normalized = normalizeDialCode(raw);

    if (!normalized) {
      return;
    }

    onChange(normalized);
    setQuery(normalized);
    setOpen(false);
  }

  return (
    <div className="relative">
      <div className="app-input flex items-center rounded-[22px] px-3 py-3.5">
        <input
          className="w-full bg-transparent text-sm outline-none"
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
            commitCustomCode(query);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitCustomCode(query);
            }
          }}
          placeholder={language === "zh-HK" ? "搜尋或輸入 +區號" : "Search or enter +code"}
          value={query}
        />
      </div>
      {open ? (
        <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_36px_rgba(15,23,42,0.16)]">
          {filtered.length ? (
            groupKeys.map((letter) => (
              <div className="pb-2" key={letter}>
                <p className="sticky top-0 z-10 rounded-lg bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {`----- ${letter} -----`}
                </p>
                {(groupedOptions.get(letter) ?? []).map((option) => (
                  <button
                    className={cn(
                      "mb-1 block w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm text-slate-700 transition",
                      "hover:border-amber-200 hover:bg-amber-50 hover:text-slate-900",
                      selectedCode === option.code && "border-amber-300 bg-amber-100 text-slate-900",
                    )}
                    key={`${option.code}-${option.label}`}
                    onClick={() => {
                      onChange(option.code);
                      setQuery(option.code);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ))
          ) : (
            <p className="px-3 py-2 text-xs text-muted">
              No match. Type your own dial code like +995 and press Enter.
            </p>
          )}
        </div>
      ) : null}
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