import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface SpectateCalendarProps {
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
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  currentYearMonth: { year: number; month: number };
  setCurrentYearMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
}

export default function SpectateCalendar({ 
  diaries,
  selectedDate, 
  onSelectDate, 
  currentYearMonth, 
  setCurrentYearMonth 
}: SpectateCalendarProps) {
  
  const { year, month } = currentYearMonth;

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const startBlankCells = getFirstDayOfWeek(year, month);

  const handlePrevMonth = () => {
    onSelectDate(null);
    setCurrentYearMonth(prev => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    onSelectDate(null);
    setCurrentYearMonth(prev => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleDateClick = (dayNum: number) => {
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const dateString = `${year}.${formattedMonth}.${formattedDay}`;

    if (selectedDate === dateString) {
      onSelectDate(null);
    } else {
      onSelectDate(dateString);
    }
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const blankCellsArray = Array.from({ length: startBlankCells });
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="w-full bg-white text-[#111111] p-6 rounded-xl border border-[#d1d5db] shadow-sm">
      
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#c8aa6e]" />
          <h2 className="text-lg font-black tracking-wide text-[#111111]">직관 전적 캘린더</h2>
        </div>
        
        <div className="flex items-center justify-center gap-6 py-1 bg-transparent">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600">
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <span className="text-base font-black text-[#0a1428] min-w-[100px] text-center tracking-wider">
            {year} . {month < 10 ? `0${month}` : month}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day, index) => (
          <span key={day} className={`text-xs font-bold py-1 ${index === 0 ? "text-[#e84057]" : index === 6 ? "text-[#38bdf8]" : "text-[#6b7280]"}`}>
            {day}
          </span>
        ))}
      </div>

      {/* 날짜 판 */}
      <div className="grid grid-cols-7 gap-1.5">
        {blankCellsArray.map((_, index) => (
          <div key={`blank-${index}`} className="min-h-[70px] bg-transparent border border-transparent"></div>
        ))}

        {daysArray.map((dayNum) => {
          const formattedMonth = month < 10 ? `0${month}` : `${month}`;
          const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          const currentDayStr = `${year}.${formattedMonth}.${formattedDay}`;
          const isSelected = selectedDate === currentDayStr;

          const matchedDiary = diaries.find(d => d.date === currentDayStr);

          // ⚡ d.result 속성이 "WIN"인지 "LOSE"인지 정확히 확인!
          const isWin = matchedDiary?.result === 'WIN';
          const isLose = matchedDiary?.result === 'LOSE';

          return (
            <div 
              key={`day-${dayNum}`} 
              onClick={() => handleDateClick(dayNum)}
              className={`min-h-[70px] p-1 rounded-md flex flex-col justify-between transition-all cursor-pointer border
                ${isSelected 
                  ? "bg-[#fbf8f0] border-2 border-[#c8aa6e] shadow-inner" 
                  : "bg-[#f9fafb] border-[#e5e7eb] hover:border-[#c8aa6e]/50 hover:bg-[#f3f4f6]" 
                }`}
            >
              <span className={`text-xs font-bold ${isSelected ? "text-[#0a1428]" : "text-[#9ca3af]"}`}>
                {dayNum}
              </span>
              
              {matchedDiary && (
                <div className="w-full flex flex-col gap-0.5 mt-1">
                  {isWin ? (
                    <div className="bg-[#ecf2ff] border border-[#b3ccff] rounded px-1 py-0.5 text-center">
                      <span className="text-[9px] font-black text-[#2255cc] block leading-none">W · vs {matchedDiary.match.split('vs')[1]}</span>
                      <span className="text-[8px] text-[#4477ee] block font-bold mt-0.5">{matchedDiary.score}</span>
                    </div>
                  ) : isLose ? (
                    <div className="bg-[#fff0f2] border border-[#ffd0d6] rounded px-1 py-0.5 text-center">
                      <span className="text-[9px] font-black text-[#d93846] block leading-none">L · vs {matchedDiary.match.split('vs')[1]}</span>
                      <span className="text-[8px] text-[#e05260] block font-bold mt-0.5">{matchedDiary.score}</span>
                    </div>
                  ) : (
                    <div className="bg-[#f3f4f6] border border-[#e5e7eb] rounded px-1 py-0.5 text-center">
                      <span className="text-[9px] font-bold text-[#6b7280] block leading-none">{matchedDiary.match}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ⚡ 하단 요정 지수 구역 (`result` 연동 버전) */}
      <div className="mt-6 pt-5 border-t border-[#e5e7eb]">
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6b7280]">승리 요정 지수 🧚‍♀️</span>
            <span className="text-[10px] bg-[#f3f4f6] text-[#9ca3af] px-1.5 py-0.5 rounded font-bold">
              총 {diaries.length}전 {diaries.filter(d => d.result === 'WIN').length}승
            </span>
          </div>
          <span className="text-sm font-black text-[#2255cc]">
            {diaries.length > 0 ? Math.floor((diaries.filter(d => d.result === 'WIN').length / diaries.length) * 100) : 0}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-[#f3f4f6] rounded-full overflow-hidden flex border border-[#e5e7eb] shadow-inner">
          <div 
            className="h-full bg-[#2255cc] transition-all duration-700 ease-out" 
            style={{ 
              width: `${diaries.length > 0 ? (diaries.filter(d => d.result === 'WIN').length / diaries.length) * 100 : 0}%` 
            }}
          ></div>
          <div 
            className="h-full bg-[#e05260] transition-all duration-700 ease-out opacity-80" 
            style={{ 
              width: `${diaries.length > 0 ? (diaries.filter(d => d.result === 'LOSE').length / diaries.length) * 100 : 0}%` 
            }}
          ></div>
        </div>

        <div className="flex justify-between mt-2 text-[10px] font-bold text-[#9ca3af]">
          <span className="text-[#2255cc]">W</span>
          <span>승률 (Win Rate)</span>
          <span className="text-[#e05260]">L</span>
        </div>
      </div>

    </div>
  );
}