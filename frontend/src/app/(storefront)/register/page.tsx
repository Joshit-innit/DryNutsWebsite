import AuthPanel from "@/components/auth/AuthPanel";

export const metadata = { title: "Create account — NutriNation" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPanel initialMode="register" next={next} />;
}
