import { redirect } from "next/navigation";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const qs = new URLSearchParams(searchParams).toString();
  redirect(qs ? `/forgot-password?${qs}` : "/forgot-password");
}