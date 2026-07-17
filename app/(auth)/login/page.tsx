import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-3xl italic text-[#1b4332]">
            Welcome Health
          </p>
          <p className="mt-2 text-sm text-[#606060]">
            Sign in to continue to the portal
          </p>
        </div>

        <div className="rounded-2xl border border-[#eceae6] bg-white p-6 shadow-sm">
          <Suspense
            fallback={
              <div className="space-y-4" aria-hidden="true">
                <div className="skeleton h-10 w-full rounded-lg" />
                <div className="skeleton h-10 w-full rounded-lg" />
                <div className="skeleton h-10 w-full rounded-lg" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
