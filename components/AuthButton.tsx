// components/AuthButton.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-sm">Hi, {session.user?.name}</span>
        <button onClick={() => signOut()} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
      </div>
    );
  }

  return (
    <button onClick={() => signIn()} className="px-3 py-1 bg-blue-600 text-white rounded">
      Login
    </button>
  );
}
