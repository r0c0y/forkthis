"use client";
import SessionWrapper from "@/components/SessionWrapper";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <SessionWrapper>
      <ProfileContent />
    </SessionWrapper>
  );
}

function ProfileContent() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saved, setSaved] = useState(false);

  // You need to implement the save logic (e.g., API call to update user name)
  const handleSave = async () => {
    // Example: await fetch("/api/user", { method: "POST", body: JSON.stringify({ name }) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!session) return <p>Please login to view your profile.</p>;

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <label className="block mb-2 text-sm font-medium">Display Name</label>
      <input
        className="border px-2 py-1 rounded w-full mb-4"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        Save
      </button>
      {saved && <span className="ml-2 text-green-600">Saved!</span>}
      <div className="mt-4">
        <Link href="/profile" className="underline text-blue-600 text-sm">
          Profile
        </Link>
      </div>
    </main>
  );
}