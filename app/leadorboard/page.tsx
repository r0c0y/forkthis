import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route"; // 👈 correct path
import { redirect } from "next/navigation";
export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // or home
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <p className="text-gray-600 mb-4">This page will show the leaderboard of users based on their contributions.</p>

      <p className="text-gray-500">Coming soon! 🚀</p>
      {/* You can implement the leaderboard logic here */}
      {/* For now, just a placeholder */}
      <div className="mt-8">
        <p className="text-gray-500">Stay tuned for updates!</p>
      </div>
  </main>
  ); 



}
