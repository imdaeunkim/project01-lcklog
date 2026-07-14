import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface SpectateCalendarProps {
  diaries: Array<{
    id: number;
    match: string;
    score: string;
    location: string;
    date: string;
    content: string;
    pom: string;
  }>; // ⚡ 추가됨
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

  // ⚡ 달의 총 일수 및 시작 요일 계산 함수
  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const startBlankCells = getFirstDayOfWeek(year, month);

  // ⚡ [월 이동 핸들러] 이동 시 선택 필터 초기화
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

  // ⚡ [날짜 클릭 핸들러]
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
      
      {/* ⚡ 다은 님이 원하신 "심플하고 직관적인 원래 레이아웃 고수" 헤더 구역 */}
      <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#c8aa6e]" />
          <h2 className="text-lg font-black tracking-wide text-[#111111]">직관 전적 캘린더</h2>
        </div>
        
        {/* 👈 👉 연/월 내비게이터 바 */}
        <div className="flex items-center justify-center gap-6 py-1 bg-transparent">
          <button 
            onClick={handlePrevMonth} 
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          
          <span className="text-base font-black text-[#0a1428] min-w-[100px] text-center tracking-wider">
            {year} . {month < 10 ? `0${month}` : month}
          </span>
          
          <button 
            onClick={handleNextMonth} 
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 요일 행 */}
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

      {/* 날짜 그리드판 */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* 시작 빈칸 */}
        {blankCellsArray.map((_, index) => (
          <div key={`blank-${index}`} className="min-h-[70px] bg-transparent border border-transparent"></div>
        ))}

        {/* 실제 일수 그리기 */}
        {daysArray.map((dayNum) => {
          const formattedMonth = month < 10 ? `0${month}` : `${month}`;
          const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          const currentDayStr = `${year}.${formattedMonth}.${formattedDay}`;
          const isSelected = selectedDate === currentDayStr;

          // ⚡ [대변혁] 다은 님이 작성한 diaries 배열에서 이 날짜와 일치하는 일기가 있는지 실시간 검색!
          const matchedDiary = diaries.find(d => d.date === currentDayStr);

          // 일기 score 텍스트 안에 'WIN'이 있으면 승리, 'LOSE'가 있으면 패배로 판별합니다.
          const isWin = matchedDiary?.score.includes('WIN');
          const isLose = matchedDiary?.score.includes('LOSE');

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
              
              {/* ⚡ 실시간으로 찾은 일기 결과에 맞춰 캘린더 칸에 뱃지 마크업 */}
              {matchedDiary && (
                <div className="w-full flex flex-col gap-0.5 mt-1">
                  {isWin ? (
                    <div className="bg-[#ecf2ff] border border-[#b3ccff] rounded px-1 py-0.5 text-center">
                      <span className="text-[9px] font-black text-[#2255cc] block leading-none">W · vs {matchedDiary.match.split('vs')[1]}</span>
                      <span className="text-[8px] text-[#4477ee] block font-bold mt-0.5">{matchedDiary.score.split(' ')[0]}</span>
                    </div>
                  ) : isLose ? (
                    <div className="bg-[#fff0f2] border border-[#ffd0d6] rounded px-1 py-0.5 text-center">
                      <span className="text-[9px] font-black text-[#d93846] block leading-none">L · vs {matchedDiary.match.split('vs')[1]}</span>
                      <span className="text-[8px] text-[#e05260] block font-bold mt-0.5">{matchedDiary.score.split(' ')[0]}</span>
                    </div>
                  ) : (
                    // WIN/LOSE 판별이 안 되는 기타 상태 처리용
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

      {/* 하단 요정 지수 구역 */}
      <div className="mt-6 pt-5 border-t border-[#e5e7eb]">
        <div className="flex items-end justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#6b7280]">승리 요정 지수 🧚‍♀️</span>
            <span className="text-[10px] bg-[#f3f4f6] text-[#9ca3af] px-1.5 py-0.5 rounded font-bold">총 5전 3승</span>
          </div>
          <span className="text-sm font-black text-[#2255cc]">60%</span>
        </div>

        <div className="w-full h-2.5 bg-[#f3f4f6] rounded-full overflow-hidden flex border border-[#e5e7eb] shadow-inner">
          <div className="h-full bg-[#2255cc] transition-all duration-700 ease-out" style={{ width: '60%' }}></div>
          <div className="h-full bg-[#e05260] transition-all duration-700 ease-out opacity-80" style={{ width: '40%' }}></div>
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