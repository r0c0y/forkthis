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
      <h1>🏆 Leaderboard</h1>
      <p>Welcome, {session.user?.name}</p>
    </main>
  ); 


  
}
