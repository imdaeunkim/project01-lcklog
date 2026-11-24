import type { Diary } from '../types/diary';
import { Award, Percent, Flame, CircleHelp } from 'lucide-react';
import { TIER_ICONS } from '../assets/tiers/tierIndex';
import { getWinStats } from '../utils/matchResult';
import {getTeamName} from '../data/teams';
interface ProfileHeaderProps {
  diaries: Diary[]; 
  nickname: string;
  tag: string;
  myTeam: string | null; // null이면 팀 없음 → 티어·승률 숨김
}
export default function ProfileHeader({
  diaries,
  nickname,
  tag,
  myTeam,
}: ProfileHeaderProps) {
  
  const { total, wins, rate } = getWinStats(diaries, myTeam);

  // 승률 기반 직관 티어 판독
  // 값은 아래 if/else에서 항상 정해짐
  let tierName: string;
  let tierIcon: string;
  let tierColor: string;

if (total === 0) {
  tierName = "UNRANKED";
  tierIcon = TIER_ICONS.UNRANKED; 
  tierColor = "text-[#94a3b8]";
} 
else if (rate === 0) {
  tierName = "IRON";
  tierIcon = TIER_ICONS.IRON; 
  tierColor = "text-[#71717a]";
} 
else if (rate >= 80) {
  tierName = "CHALLENGER";
  tierIcon = TIER_ICONS.CHALLENGER;
  tierColor = "text-[#38bdf8] font-extrabold animate-pulse";
} 
else if (rate >= 50) {
  tierName = "DIAMOND";
  tierIcon = TIER_ICONS.DIAMOND;
  tierColor = "text-[#38bdf8]";
} 
else if (rate >= 30) {
  tierName = "GOLD";
  tierIcon = TIER_ICONS.GOLD;
  tierColor = "text-[#facc15]";
} 
else {
  tierName = "BRONZE";
  tierIcon = TIER_ICONS.BRONZE;
  tierColor = "text-[#fb923c]";
}

  return (
    <div className="w-full bg-[#0a1428] text-[#f0e6d2] p-6 rounded-xl border border-[#c8aa6e] shadow-2xl mb-6">
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    
    {/* min-w-0: 닉네임이 길어도 이 영역이 넘치지 않고 줄어들게 함 */}
    <div className="flex min-w-0 max-w-full items-start md:flex-1 md:items-center gap-5">
      {/*  프로필 영역 */}
      <div className="relative flex-shrink-0">
        <div className="w-20 h-20 bg-[#1e232a] rounded-full border-2 border-[#c8aa6e] flex items-center justify-center overflow-hidden shadow-inner">
          <span className="text-3xl">🧙‍♂️</span>
        </div>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#c8aa6e] text-[#0a1428] text-xs font-bold px-2 py-0.5 rounded-full border border-[#0a1428] whitespace-nowrap">
          Lv.{15 + diaries.length}
        </span>
      </div>
      
      <div className="flex min-w-0 flex-col items-start text-left">
        {/* 닉네임 + 태그. 닉네임은 한 줄 고정, 넘치면 …로 자르고 마우스를 올리면 전체 표시. 태그는 항상 옆에 붙음 */}
        <div className="flex max-w-full items-baseline gap-1.5">
          <h1 className="min-w-0 truncate text-2xl font-black tracking-wide text-white" title={`${nickname}#${tag}`}>{nickname}</h1>
          <span className="shrink-0 text-sm font-bold text-[#616c7f]">#{tag}</span>
        </div>

        {/*티어 + 직관 승률. 팀 없음이면 숨김.
            넓은 화면(lg)에서만 한 줄, 그 외에는 설명을 티어 아래 줄에 둠. 설명은 줄바꿈 안 함 */}
        {myTeam && (
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-1 mt-1 tracking-wider">
          <div className="flex items-center gap-1.5">
            <img src={tierIcon} className="size-9 object-contain" alt={tierName} />
            <span className={`font-black ${tierColor}`}>{tierName}</span>
          </div>

          <span className="whitespace-nowrap text-xs text-[#616c7f] font-normal lg:ml-1">
            (직관 {total}회 중 {wins}승 · 승률 {rate}%)
          </span>
        </div>
        )}
      </div>
    </div>

        {/* 팀 없음이면 승률 칸이 빠져서 2칸 */}
        <div className={`grid ${myTeam ? 'grid-cols-3' : 'grid-cols-2'} gap-3 sm:gap-4 w-full md:w-auto md:min-w-[360px] md:shrink-0`}>
          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <Award className="size-5 text-[#38bdf8] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">올해 직관</span>
            <span className="text-base font-black text-white">{diaries.length}회</span>
          </div>

          {myTeam && (
          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <Percent className="size-5 text-[#fbbf24] mb-1" />
            <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#616c7f] font-bold block">직관 승률</span>
            <span className="relative group cursor-help">
              <CircleHelp className="size-4 text-[#808080]" />

              {/* 말풍선: 평소엔 숨김, 부모(group)에 마우스를 올리면 표시 */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                   invisible opacity-0 group-hover:visible group-hover:opacity-80 transition-opacity
                   whitespace-nowrap rounded-md border border-[#c8aa6e] bg-[#0a1428] 
                   px-2.5 py-1.5 text-[11px] font-bold text-[#f0e6d2] shadow-lg z-20">
              승률은 응원팀 경기 기준으로 계산돼요
              </span>
            </span>
            </div>
            <span className="text-base font-black text-white">{rate}%</span>
          </div>
          )}

          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <Flame className="size-5 text-[#f43f5e] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">모스트 팀</span>
            <span className="text-sm font-black px-2 py-0.5 rounded bg-[#f43f5e] text-white mt-0.5 shadow-sm">
              { myTeam ? getTeamName(myTeam) : '없음' }
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}