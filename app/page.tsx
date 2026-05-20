import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function RootPage({ searchParams }: PageProps) {
  const { code } = await searchParams;
  if (code) {
    redirect(`/auth/reset-password?code=${code}`);
  }
  redirect("/admin");
}
