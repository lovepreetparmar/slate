import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="slate-page">
      <div className="slate-surface flex items-center justify-center min-h-[28rem] px-8 py-12">
        <LoginForm />
      </div>
    </main>
  );
}
