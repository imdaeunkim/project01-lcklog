import type { Diary } from '../types/diary';
import { Award, Percent, Flame, CircleHelp } from 'lucide-react';
import { TIER_ICONS } from '../assets/tiers/tierIndex';
import { getWinStats } from '../utils/matchResult';
import {getTeamName} from '../data/teams';
interface ProfileHeaderProps {
  diaries: Diary[]; 
  nickname?: string;
  tagline?: string;
  myTeam: string;
}
export default function ProfileHeader({
  diaries,
  nickname = "vinaka",
  tagline = "kr1",  
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
    
    <div className="flex items-start md:items-center gap-5">
      {/*  프로필 영역 */}
      <div className="relative flex-shrink-0">
        <div className="w-20 h-20 bg-[#1e232a] rounded-full border-2 border-[#c8aa6e] flex items-center justify-center overflow-hidden shadow-inner">
          <span className="text-3xl">🧙‍♂️</span>
        </div>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#c8aa6e] text-[#0a1428] text-xs font-bold px-2 py-0.5 rounded-full border border-[#0a1428] whitespace-nowrap">
          Lv.{15 + diaries.length}
        </span>
      </div>
      
      <div className="flex flex-col items-start text-left">
        {/* 닉네임 + 태그 */}
        <div className="flex items-baseline gap-1.5">
          <h1 className="text-2xl font-black tracking-wide text-white">{nickname}</h1>
          <span className="text-sm font-bold text-[#616c7f]">#{tagline}</span>
        </div>
        
        {/*티어 + 직관 승률*/}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 mt-1 tracking-wider">
          <div className="flex items-center gap-1.5">
            <img src={tierIcon} className="size-9 object-contain" alt={tierName} />
            <span className={`font-black ${tierColor}`}>{tierName}</span>
          </div>
          
          <span className="text-xs text-[#616c7f] font-normal md:ml-1">
            (직관 {total}회 중 {wins}승 · 승률 {rate}%)
          </span>
        </div>
      </div>
    </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto md:min-w-[360px]">
          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <Award className="size-5 text-[#38bdf8] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">올해 직관</span>
            <span className="text-base font-black text-white">{diaries.length}회</span>
          </div>

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

          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <Flame className="size-5 text-[#f43f5e] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">모스트 팀</span>
            <span className="text-sm font-black px-2 py-0.5 rounded bg-[#f43f5e] text-white mt-0.5 shadow-sm">
              { getTeamName(myTeam) }
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}