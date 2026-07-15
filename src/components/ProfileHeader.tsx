import React from 'react';
import { Award, Percent, Flame } from 'lucide-react';

interface ProfileHeaderProps {
  diaries: Array<{
    id: number;
    match: string;
    score: string;
    result: string; // ⚡ result 타입 추가
    location: string;
    date: string;
    content: string;
    pom: string;
  }>;
  nickname?: string;
  tagline?: string;
  mostTeam?: string;
}

export default function ProfileHeader({
  diaries = [],
  nickname = "민동통구리",
  tagline = "LCK",
  mostTeam = "HLE",
}: ProfileHeaderProps) {
  
  const myAttendanceCount = diaries.length;

  // 🎯 실제 result가 "WIN"인 것만 필터링!
  const winMatches = diaries.filter(d => d.result === "WIN").length;

  const attendanceRate = myAttendanceCount > 0 
    ? Math.floor((winMatches / myAttendanceCount) * 100) 
    : 0;

  // 👑 실제 '승률(%)' 기반 롤 티어 판독기 규칙
  let tierName = "UNRANKED";
  let tierEmoji = "🥚";
  let tierColor = "text-[#94a3b8]";

  if (myAttendanceCount === 0) {
    tierName = "UNRANKED";
    tierEmoji = "🥚";
    tierColor = "text-[#94a3b8]";
  } else if (attendanceRate >= 90) {
    tierName = "CHALLENGER";
    tierEmoji = "👑";
    tierColor = "text-[#f43f5e] font-extrabold animate-pulse"; 
  } else if (attendanceRate >= 60) {
    tierName = "DIAMOND";
    tierEmoji = "💎";
    tierColor = "text-[#38bdf8]"; 
  } else if (attendanceRate >= 35) {
    tierName = "GOLD";
    tierEmoji = "🥇";
    tierColor = "text-[#fbbf24]"; 
  } else {
    tierName = "BRONZE";
    tierEmoji = "🥉";
    tierColor = "text-[#b45309]"; 
  }

  return (
    <div className="w-full bg-[#0a1428] text-[#f0e6d2] p-6 rounded-xl border border-[#c8aa6e] shadow-2xl mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-[#1e232a] rounded-full border-2 border-[#c8aa6e] flex items-center justify-center overflow-hidden shadow-inner">
              <span className="text-3xl">🧙‍♂️</span>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#c8aa6e] text-[#0a1428] text-xs font-bold px-2 py-0.5 rounded-full border border-[#0a1428]">
              Lv.{15 + myAttendanceCount}
            </span>
          </div>
          
          <div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-2xl font-black tracking-wide text-white">{nickname}</h1>
              <span className="text-sm font-bold text-[#616c7f]">#{tagline}</span>
            </div>
            
            <div className={`flex items-center gap-1 mt-1 text-sm font-black tracking-wider ${tierColor}`}>
              <span>{tierEmoji}</span>
              <span>{tierName}</span>
              <span className="text-xs text-[#616c7f] font-normal ml-1">
                (직관 {myAttendanceCount}회 중 {winMatches}승 · 승률 {attendanceRate}%)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full md:w-auto min-w-[360px]">
          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <Award className="w-5 h-5 text-[#38bdf8] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">올해 직관</span>
            <span className="text-base font-black text-white">{myAttendanceCount}회</span>
          </div>

          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <Percent className="w-5 h-5 text-[#fbbf24] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">직관 승률</span>
            <span className="text-base font-black text-white">{attendanceRate}%</span>
          </div>

          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <Flame className="w-5 h-5 text-[#f43f5e] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">모스트 팀</span>
            <span className="text-sm font-black px-2 py-0.5 rounded bg-[#f43f5e] text-white mt-0.5 shadow-sm">
              {mostTeam}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}