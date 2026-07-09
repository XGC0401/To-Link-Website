import { AuthForms } from "@/features/auth/auth-forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return <AuthForms mode={params.oobCode ? "reset" : "forgot"} />;
}