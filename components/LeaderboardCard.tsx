import Image from 'next/image';
import { GitHubUser } from '@/types/github';

interface LeaderboardCardProps {
  user: GitHubUser;
  count: number;
  rank: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ user, count, rank }) => {
  let rankColor = 'bg-gray-700'; // Default color
  let rankTextColor = 'text-white';
  let cardBorder = 'border-gray-600';

  if (rank === 1) {
    rankColor = 'bg-yellow-500'; // Gold
    rankTextColor = 'text-black';
    cardBorder = 'border-yellow-500 shadow-lg shadow-yellow-500/30';
  } else if (rank === 2) {
    rankColor = 'bg-slate-400'; // Silver
    rankTextColor = 'text-black';
    cardBorder = 'border-slate-400 shadow-lg shadow-slate-400/30';
  } else if (rank === 3) {
    rankColor = 'bg-orange-600'; // Bronze
    rankTextColor = 'text-white';
    cardBorder = 'border-orange-600 shadow-lg shadow-orange-600/30';
  }


  return (
    <div className={`flex items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${cardBorder} bg-gray-800 mb-3`}>
      <div className={`w-10 h-10 ${rankColor} ${rankTextColor} flex items-center justify-center rounded-full font-bold text-lg mr-4`}>
        {rank}
      </div>
      <Image
        src={user.avatar_url}
        alt={`${user.login}'s avatar`}
        width={48}
        height={48}
        className="rounded-full mr-4 border-2 border-gray-500"
      />
      <div className="flex-grow">
        <a
          href={`https://github.com/${user.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-blue-400 hover:text-blue-300 hover:underline"
        >
          {user.login}
        </a>
      </div>
      <div className="text-xl font-bold text-gray-100">
        {count} <span className="text-sm font-normal text-gray-400">issues</span>
      </div>
    </div>
  );
};

export default LeaderboardCard;
