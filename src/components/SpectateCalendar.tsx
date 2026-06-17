import React from 'react';
import { Calendar } from 'lucide-react';

export default function SpectateCalendar() {
  const days = [
    { date: 1, match: null },
    { date: 2, match: null },
    { date: 3, match: { opponent: "KT", result: "WIN", score: "2:0" } },
    { date: 4, match: null },
    { date: 5, match: null },
    { date: 6, match: null },
    { date: 7, match: { opponent: "GEN", result: "LOSE", score: "1:2" } },
    { date: 8, match: null },
    { date: 9, match: null },
    { date: 10, match: null },
    { date: 11, match: { opponent: "HLE", result: "WIN", score: "2:1" } },
    { date: 12, match: null },
    { date: 13, match: null },
    { date: 14, match: { opponent: "DK", result: "WIN", score: "2:0" } },
    { date: 15, match: null },
    { date: 16, match: null },
    { date: 17, match: null }, // 오늘
    { date: 18, match: { opponent: "BRO", result: "LOSE", score: "0:2" } },
    { date: 19, match: null },
    { date: 20, match: null },
    { date: 21, match: { opponent: "NS", result: "FUTURE", score: "예정" } },
    { date: 22, match: null },
    { date: 23, match: null },
    { date: 24, match: null },
    { date: 25, match: { opponent: "DRX", result: "FUTURE", score: "예정" } },
    { date: 26, match: null },
    { date: 27, match: null },
    { date: 28, match: { opponent: "GEN", result: "FUTURE", score: "예정" } },
    { date: 29, match: null },
    { date: 30, match: null },
  ];

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    /* 🤍 화이트 카드 배경 + 확실한 흑연색 테두리 */
    <div className="w-full bg-white text-[#111111] p-6 rounded-xl border border-[#d1d5db] shadow-sm">
      
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#c8aa6e]" />
          <h2 className="text-lg font-black tracking-wide text-[#111111]">직관 전적 캘린더</h2>
        </div>
        <span className="text-xs font-bold text-[#6b7280] tracking-wider">2026 . 06</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day, index) => (
          <span 
            key={day} 
            className={`text-xs font-bold py-1 ${
              index === 0 ? "text-[#e84057]" : index === 6 ? "text-[#38bdf8]" : "text-[#6b7280]"
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((item) => (
          <div 
            key={item.date} 
            className="min-h-[70px] bg-[#f9fafb] border border-[#e5e7eb] p-1 rounded-md flex flex-col justify-between hover:border-[#c8aa6e] transition-colors"
          >
            <span className="text-xs font-bold text-[#9ca3af]">{item.date}</span>
            
            {item.match && (
              <div className="w-full flex flex-col gap-0.5 mt-1">
                {item.match.result === "WIN" && (
                  /* 라이트 모드용 화사한 블루 전적 */
                  <div className="bg-[#ecf2ff] border border-[#b3ccff] rounded px-1 py-0.5 text-center">
                    <span className="text-[9px] font-black text-[#2255cc] block leading-none">W · vs {item.match.opponent}</span>
                    <span className="text-[8px] text-[#4477ee] block font-bold mt-0.5">{item.match.score}</span>
                  </div>
                )}
                
                {item.match.result === "LOSE" && (
                  /* 라이트 모드용 화사한 레드 전적 */
                  <div className="bg-[#fff0f2] border border-[#ffd0d6] rounded px-1 py-0.5 text-center">
                    <span className="text-[9px] font-black text-[#d93846] block leading-none">L · vs {item.match.opponent}</span>
                    <span className="text-[8px] text-[#e05260] block font-bold mt-0.5">{item.match.score}</span>
                  </div>
                )}

                {item.match.result === "FUTURE" && (
                  <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded px-1 py-0.5 text-center">
                    <span className="text-[9px] font-bold text-[#6b7280] block leading-none">vs {item.match.opponent}</span>
                    <span className="text-[8px] text-[#9ca3af] block font-medium mt-0.5">{item.match.score}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

{/* 👑 하단 요약 (승리 요정 승률 게이지 바) */}
      <div className="mt-6 pt-5 border-t border-[#e5e7eb]">
        
        {/* 게이지 바 상단 텍스트 */}
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6b7280]">승리 요정 지수 🧚‍♀️</span>
            <span className="text-[10px] bg-[#f3f4f6] text-[#9ca3af] px-1.5 py-0.5 rounded font-bold">총 5전 3승</span>
          </div>
          <span className="text-sm font-black text-[#2255cc]">60%</span>
        </div>

        {/* 게이지 바 본체 */}
        <div className="w-full h-2.5 bg-[#f3f4f6] rounded-full overflow-hidden flex border border-[#e5e7eb] shadow-inner">
          {/* 승리 게이지 (파란색, width 값으로 퍼센트 조절) */}
          <div 
            className="h-full bg-[#2255cc] transition-all duration-700 ease-out" 
            style={{ width: '60%' }}
            title="승리 60%"
          ></div>
          {/* 패배 게이지 (빨간색, 원치 않으시면 이 줄은 지워도 됩니다) */}
          <div 
            className="h-full bg-[#e05260] transition-all duration-700 ease-out opacity-80" 
            style={{ width: '40%' }}
            title="패배 40%"
          ></div>
        </div>

        {/* 하단 범례 */}
        <div className="flex justify-between mt-2 text-[10px] font-bold text-[#9ca3af]">
          <span className="text-[#2255cc]">W</span>
          <span>승률 (Win Rate)</span>
          <span className="text-[#e05260]">L</span>
        </div>

      </div>

    </div> /* <- 달력 전체를 감싸는 마지막 닫는 태그 */
  );
}