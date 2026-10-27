import AuthPanel from "@/components/auth/AuthPanel";

export const metadata = { title: "Sign in — NutriNation" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthPanel initialMode="signin" next={next} />;
}
