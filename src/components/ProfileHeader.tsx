import React from 'react';
import { Award, Percent, Flame } from 'lucide-react';

// 부모 컴포넌트(App.tsx)로부터 받아올 데이터 명세표
interface ProfileHeaderProps {
  nickname: string;
  tagline: string;
  mostTeam: string;
  myMostTeamMatches: number; // 내가 간 모스트 팀 직관 횟수 (분자)
  totalMostTeamMatches: number; // 크롤링 등으로 가져올 모스트 팀의 총 경기 수 (분모)
}

export default function ProfileHeader({
  nickname = "민동통구리",
  tagline = "LCK",
  mostTeam = "T1",
  myMostTeamMatches = 5, // 임시 더미 데이터 (테스트용)
  totalMostTeamMatches = 20, // 임시 더미 데이터 (테스트용)
}: ProfileHeaderProps) {
  
  // 🎯 오늘 기획한 "모스트 팀 직관 비율" 계산기
  const attendanceRate = totalMostTeamMatches > 0 
    ? (myMostTeamMatches / totalMostTeamMatches) * 100 
    : 0;

  // 👑 비율에 따른 롤 티어 판독기 규칙
  let tierName = "BRONZE";
  let tierEmoji = "🥉";
  let tierColor = "text-[#a77044]"; // 브론즈 브라운

  if (attendanceRate >= 50) {
    tierName = "CHALLENGER";
    tierEmoji = "👑";
    tierColor = "text-[#f43f5e] font-extrabold animate-pulse"; // 빛나는 챌린저 레드
  } else if (attendanceRate >= 30) {
    tierName = "DIAMOND";
    tierEmoji = "💎";
    tierColor = "text-[#38bdf8]"; // 다이아 블루
  } else if (attendanceRate >= 20) {
    tierName = "GOLD";
    tierEmoji = "🥇";
    tierColor = "text-[#fbbf24]"; // 골드 황금색
  } else if (attendanceRate >= 10) {
    tierName = "SILVER";
    tierEmoji = "🥈";
    tierColor = "text-[#94a3b8]"; // 실버 그레이
  }

  return (
    <div className="w-full bg-[#0a1428] text-[#f0e6d2] p-6 rounded-xl border border-[#c8aa6e] shadow-2xl mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* 왼쪽 영역: 소환사 아이콘 및 닉네임 */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-[#1e232a] rounded-full border-2 border-[#c8aa6e] flex items-center justify-center overflow-hidden shadow-inner">
              {/* 임시 캐릭터 이모지 (추후 이미지 대체 가능) */}
              <span className="text-3xl">🧙‍♂️</span>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#c8aa6e] text-[#0a1428] text-xs font-bold px-2 py-0.5 rounded-full border border-[#0a1428]">
              Lv.15
            </span>
          </div>
          
          <div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-2xl font-black tracking-wide text-white">{nickname}</h1>
              <span className="text-sm font-bold text-[#616c7f]">#{tagline}</span>
            </div>
            {/* 실시간 티어 뱃지 */}
            <div className={`flex items-center gap-1 mt-1 text-sm font-black tracking-wider ${tierColor}`}>
              <span>{tierEmoji}</span>
              <span>{tierName}</span>
              <span className="text-xs text-[#616c7f] font-normal ml-1">
                ({attendanceRate.toFixed(0)}% 출석)
              </span>
            </div>
          </div>
        </div>

        {/* 오른쪽 영역: 롤 인게임 스탯 카드창 */}
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto min-w-[360px]">
          {/* 스탯 1: 직관 횟수 */}
          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <Award className="w-5 h-5 text-[#38bdf8] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">올해 직관</span>
            <span className="text-base font-black text-white">{myMostTeamMatches}회</span>
          </div>

          {/* 스탯 2: 직관 승률 */}
          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center">
            <Percent className="w-5 h-5 text-[#fbbf24] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">직관 승률</span>
            <span className="text-base font-black text-white">100%</span>
          </div>

          {/* 스탯 3: 모스트 팀 (손그림 감성 일러스트풍 컴포넌트 자리) */}
          <div className="bg-[#121c2c] border border-[#1e2837] p-3 rounded-lg text-center flex flex-col items-center justify-center relative overflow-hidden group">
            <Flame className="w-5 h-5 text-[#f43f5e] mb-1" />
            <span className="text-[11px] text-[#616c7f] font-bold block">모스트 팀</span>
            {/* 추후 일러스트 패키지가 들어올 자리. 지금은 롤 클라이언트 뱃지 감성 */}
            <span className="text-sm font-black px-2 py-0.5 rounded bg-[#f43f5e] text-white mt-0.5 shadow-sm">
              🎨 {mostTeam}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}