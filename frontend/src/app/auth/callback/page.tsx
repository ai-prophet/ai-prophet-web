"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallbackPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.push("/");
    }
  }, [isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-ground">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
        {isLoading ? (
          <>
            <h2 className="text-xl font-semibold text-primary mb-2">
              Completing login...
            </h2>
            <p className="text-secondary">
              Please wait while we finish setting up your session.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-primary mb-2">
              Authentication Complete!
            </h2>
            {user && (
              <p className="text-sm text-secondary">Welcome, {user.name}!</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
