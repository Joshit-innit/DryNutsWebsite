import { redirect } from "next/navigation";

// Admins and customers share one sign-in page; the account's role decides where they land.
export default function AdminLoginPage() {
  redirect("/login?next=/admin");
}
