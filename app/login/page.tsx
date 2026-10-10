import { LoginForm } from "@/components/sections/login-form";
export const metadata = { title: "Login" };
export default function LoginPage() {
  return (
    <main id="main" className="flex-1 px-6">
      <LoginForm />
    </main>
  );
}
