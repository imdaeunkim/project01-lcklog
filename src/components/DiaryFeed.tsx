import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Plus, MessageSquare, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface DiaryFeedProps {
  diaries: Array<{
    id: number;
    match: string;
    score: string;
    location: string;
    date: string;
    content: string;
    pom: string;
    pickedChampions?: Record<string, { name: string; imageUrl: string }>; // 밴픽 데이터
  }>;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onOpenModal: () => void;
}

export default function DiaryFeed({ diaries, selectedDate, onSelectDate, onOpenModal }: DiaryFeedProps) {
  const [expandedId, setExpandedId] = useState<number | null>(1); 

  const filteredDiaries = diaries.filter(diary => {
    if (!selectedDate) return true;
    return diary.date === selectedDate;
  });

  useEffect(() => {
    if (filteredDiaries.length > 0) {
      setExpandedId(filteredDiaries[0].id);
    } else {
      setExpandedId(null);
    }
  }, [selectedDate, diaries]);

  const handleCardClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ⚡ [유틸 함수] 해당 일기에 몇 세트까지 챔피언 데이터가 존재하는지 알아내는 함수
  // "game0-", "game1-", "game2-" 등으로 저장된 키의 개수를 기반으로 세트 수를 파악합니다.
  const getGameCount = (pickedChamps?: Record<string, any>) => {
    if (!pickedChamps) return 0;
    const keys = Object.keys(pickedChamps);
    let maxGameIdx = -1;
    keys.forEach(key => {
      const match = key.match(/^game(\d+)-/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (idx > maxGameIdx) maxGameIdx = idx;
      }
    });
    return maxGameIdx + 1; // 0부터 시작하므로 +1 해서 게임 세트 수 반환 (예: maxGameIdx가 2면 3세트 경기)
  };

  return (
    <div className="w-full text-[#111111] relative">
      
      {/* 피드 헤더 */}
      <div className="flex items-center justify-between border-b border-[#d1d5db] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#c8aa6e]" />
          <h2 className="text-lg font-black tracking-wide text-[#111111]">
            {selectedDate ? `${selectedDate.split('.')[2]}일의 직관 기록` : "나의 직관 일기"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {selectedDate && (
            <button 
              onClick={() => onSelectDate(null)}
              className="text-xs font-bold text-[#2255cc] bg-[#ecf2ff] px-2 py-0.5 rounded-full hover:bg-[#dbe4ff] transition-colors"
            >
              필터 해제 ✕
            </button>
          )}
          <span className="text-xs font-bold text-[#6b7280] tracking-wider">{filteredDiaries.length}개의 기록</span>
        </div>
      </div>

      {/* 일기 리스트 구역 */}
      <div className="flex flex-col gap-4">
        {filteredDiaries.length > 0 ? (
          filteredDiaries.map((diary) => {
            const isExpanded = expandedId === diary.id;
            const gameCount = getGameCount(diary.pickedChampions); // ⚡ 세트 수 계산 (1세트 ~ 5세트)

            return (
              <div 
                key={diary.id} 
                className={`bg-white rounded-xl shadow-sm transition-all duration-200 border overflow-hidden
                  ${isExpanded 
                    ? "border-2 border-[#c8aa6e] ring-4 ring-[#c8aa6e]/5 shadow-md" 
                    : "border-[#d1d5db] hover:border-[#9ca3af]" 
                  }`}
              >
                {/* 1. 상단 카드 정보 영역 */}
                <div 
                  onClick={() => handleCardClick(diary.id)}
                  className="p-5 flex gap-5 items-start cursor-pointer select-none"
                >
                  <div className="shrink-0">
                    <img 
                      src="https://placehold.co/180x180/f3f4f6/a7aaaf?text=MATCH+PHOTO" 
                      alt="경기 스크린샷" 
                      className="w-28 h-28 rounded-lg border border-[#e5e7eb] object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-2 relative pr-8">
                    <div className="flex flex-wrap items-center gap-2 border-b border-[#f3f4f6] pb-2">
                      <span className="text-xs font-black bg-[#0a1428] border border-[#c8aa6e] px-2 py-0.5 rounded text-[#f0e6d2]">
                        {diary.match}
                      </span>
                      <span className="text-xs font-black text-[#2255cc] bg-[#ecf2ff] px-1.5 py-0.5 rounded">
                        {diary.score}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#6b7280]">
                        <MapPin className="w-3 h-3 text-[#e84057]" />
                        <span>{diary.location}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#9ca3af] ml-auto">{diary.date}</span>
                    </div>

                    <p className="text-sm text-[#374151] font-medium line-clamp-2 leading-relaxed">
                      "{diary.content}"
                    </p>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 mt-1">
                      <Trophy className="w-3 h-3 text-[#fbbf24]" />
                      <span>POM: <strong className="text-black font-black">{diary.pom}</strong></span>
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* 2. ⚡ [대변혁] 세트별로 줄바꿈(bo3/bo5)되어 나타나는 밴픽 전적판 */}
                {isExpanded && (
                  <div className="bg-[#f8f9fa] border-t border-[#e5e7eb] p-5 animate-slideDown flex flex-col gap-4">
                    
                    {gameCount > 0 ? (
                      // ⚡ 세트 수만큼 줄바꿈 맵핑 시작!
                      Array.from({ length: gameCount }).map((_, gameIdx) => (
                        <div 
                          key={`game-row-${gameIdx}`} 
                          className="bg-white border border-[#e5e7eb] rounded-xl p-3 shadow-sm flex items-center justify-between gap-2"
                        >
                          {/* 🔵 블루팀 5명 가로 정렬 */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((box) => {
                              const slotKey = `game${gameIdx}-blue-${box}`;
                              const champ = diary.pickedChampions?.[slotKey];
                              return (
                                <div key={`blue-${gameIdx}-${box}`} className="relative group">
                                  {champ ? (
                                    <img 
                                      src={champ.imageUrl} 
                                      alt={champ.name} 
                                      className="w-9 h-9 rounded-md object-cover border border-[#b3ccff] hover:scale-105 transition-transform" 
                                      title={`블루 ${box}번: ${champ.name}`}
                                    />
                                  ) : (
                                    <div className="w-9 h-9 bg-[#ecf2ff] border border-dashed border-[#b3ccff] rounded-md flex items-center justify-center text-[10px] text-[#4477ee] font-bold">?</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 🎯 가운데 게임 세트 뱃지 */}
                          <div className="text-[10px] font-black bg-[#0a1428] text-[#f0e6d2] px-2.5 py-1 rounded-md shrink-0 shadow-sm">
                            GAME {gameIdx + 1}
                          </div>

                          {/* 🔴 레드팀 5명 가로 정렬 */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((box) => {
                              const slotKey = `game${gameIdx}-red-${box}`;
                              const champ = diary.pickedChampions?.[slotKey];
                              return (
                                <div key={`red-${gameIdx}-${box}`} className="relative group">
                                  {champ ? (
                                    <img 
                                      src={champ.imageUrl} 
                                      alt={champ.name} 
                                      className="w-9 h-9 rounded-md object-cover border border-[#ffd0d6] hover:scale-105 transition-transform" 
                                      title={`레드 ${box}번: ${champ.name}`}
                                    />
                                  ) : (
                                    <div className="w-9 h-9 bg-[#fff0f2] border border-dashed border-[#ffd0d6] rounded-md flex items-center justify-center text-[10px] text-[#e05260] font-bold">?</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      ))
                    ) : (
                      // 챔피언 데이터가 없을 때 띄워줄 예외 처리
                      <div className="text-center py-4 text-xs font-bold text-gray-400 bg-white border rounded-xl">
                        기록된 챔피언 밴픽 정보가 없습니다.
                      </div>
                    )}

                    {/* 추가 정보 피드백 공간 */}
                    <div className="text-xs text-gray-500 font-medium bg-[#f9fafb] border p-3 rounded-lg flex flex-col gap-1">
                     
                      <div className="mt-1 leading-relaxed">📝 <strong className="text-gray-700">전체 소감:</strong> {diary.content}</div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="w-full bg-white border border-dashed border-[#d1d5db] rounded-xl py-12 px-4 flex flex-col items-center justify-center text-center gap-3">
            <span className="text-3xl">🏜️</span>
            <p className="text-sm font-black text-[#0a1428]">{selectedDate}에는 직관 기록이 없습니다.</p>
            <p className="text-xs text-gray-400 font-bold">새로운 일기를 작성하거나 전체 일기를 확인해 보세요.</p>
            <button
              onClick={() => onSelectDate(null)}
              className="mt-2 flex items-center gap-1.5 text-xs font-black bg-[#0a1428] text-[#f0e6d2] px-4 py-2 rounded-lg border border-[#c8aa6e] hover:bg-[#121c2c] transition-colors shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              전체 기록 보기
            </button>
          </div>
        )}
      </div>

      {/* 우측 하단 플로팅 버튼 */}
      <button
        onClick={onOpenModal} 
        className="fixed bottom-8 right-8 z-50 bg-[#0a1428] hover:bg-[#121c2c] text-[#f0e6d2] p-4 rounded-full shadow-2xl transition-transform hover:scale-110 border-2 border-[#c8aa6e]"
        title="오늘의 직관 기록하기"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

    </div>
  );
}