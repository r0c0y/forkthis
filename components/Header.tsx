

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import ThemeSelector from "./ThemeSelector";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex justify-between items-center mb-4">
      <div>
        <Link href="/projects" className="text-blue-600 underline text-sm hover:text-blue-800">
          
 View Saved Projects
        </Link>
        <Link href="/bookmarks" className="text-sm underline text-blue-600 hover:text-blue-800 block mt-2">
          
 View Bookmarked Issues
        </Link>
        <Link href="/history" className="text-sm underline text-blue-600 hover:text-blue-800 block mt-2">
          
 View History
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSelector />
        {session ? (
          <>
            <span className="text-sm">
 {session.user?.name || session.user?.email}</span>
            <Link href="/profile" className="underline text-blue-600 text-sm">Profile</Link>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}

