import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, Plus, MessageSquare, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';

interface DiaryFeedProps {
  diaries: Array<{
    id: number;
    match: string;
    score: string;
    location: string;
    date: string;
    content: string;
    pom: string;
    image?: string; 
    images?: string[]; 
    representativeIndex?: number;
    pickedChampions?: Record<string, { name: string; imageUrl: string }>; 
  }>;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onOpenModal: () => void;
  onEdit: (diary: any) => void;
}

export default function DiaryFeed({ diaries, selectedDate, onSelectDate, onOpenModal, onEdit }: DiaryFeedProps) {
  const [expandedId, setExpandedId] = useState<number | null>(1); 
  const [activeImagePopup, setActiveImagePopup] = useState<string | null>(null);

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
    return maxGameIdx + 1; 
  };

  return (
    <div className="w-full text-[#111111] relative">
      
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

      <div className="flex flex-col gap-4">
        {filteredDiaries.length > 0 ? (
          filteredDiaries.map((diary) => {
            const isExpanded = expandedId === diary.id;
            const gameCount = getGameCount(diary.pickedChampions); 

            const repIdx = diary.representativeIndex ?? 0;
            const hasImages = diary.images && diary.images.length > 0;
            const repImage = hasImages ? diary.images?.[repIdx] : diary.image;

            return (
              <div 
                key={diary.id} 
                className={`bg-white rounded-xl shadow-sm transition-all duration-200 border overflow-hidden
                  ${isExpanded 
                    ? "border-2 border-[#c8aa6e] ring-4 ring-[#c8aa6e]/5 shadow-md" 
                    : "border-[#d1d5db] hover:border-[#9ca3af]" 
                  }`}
              >
                <div 
                  onClick={() => handleCardClick(diary.id)}
                  className="p-5 flex gap-5 items-start cursor-pointer select-none"
                >
                  <div className="shrink-0">
                    <img 
                      src={repImage || "https://placehold.co/180x180/f3f4f6/a7aaaf?text=MATCH+PHOTO"} 
                      alt="경기 스크린샷" 
                      className={`w-28 h-28 rounded-lg border border-[#e5e7eb] object-cover transition-transform duration-300
                        ${repImage ? 'cursor-zoom-in hover:scale-[1.02]' : ''}`}
                      onClick={(e) => {
                        if (repImage) {
                          e.stopPropagation(); 
                          setActiveImagePopup(repImage); 
                        }
                      }}
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

                {isExpanded && (
                  <div className="bg-[#f8f9fa] border-t border-[#e5e7eb] p-5 animate-slideDown flex flex-col gap-4">
                    
                    {gameCount > 0 ? (
                      Array.from({ length: gameCount }).map((_, gameIdx) => (
                        <div 
                          key={`game-row-${gameIdx}`} 
                          className="bg-white border border-[#e5e7eb] rounded-xl p-3 shadow-sm flex items-center justify-between gap-2"
                        >
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

                          <div className="text-[10px] font-black bg-[#0a1428] text-[#f0e6d2] px-2.5 py-1 rounded-md shrink-0 shadow-sm">
                            GAME {gameIdx + 1}
                          </div>

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
                      <div className="text-center py-4 text-xs font-bold text-gray-400 bg-white border rounded-xl">
                        기록된 챔피언 밴픽 정보가 없습니다.
                      </div>
                    )}

                    <div className="text-xs text-gray-500 font-medium bg-[#f9fafb] border p-4 rounded-lg flex flex-col gap-1">
                      <div className="leading-relaxed">📝 <strong className="text-gray-700">전체 소감:</strong> {diary.content}</div>
                      
                      {/* 이미지 슬라이더 갤러리 */}
                      {diary.images && diary.images.length > 0 && (
                        <div className="mt-4 border-t border-gray-200/60 pt-3">
                          <span className="text-[10px] font-bold text-[#6b7280] block mb-2">📸 직관 현장 갤러리</span>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {diary.images.map((imgUrl, idx) => {
                              const isRep = idx === repIdx;
                              return (
                                <div 
                                  key={idx} 
                                  className={`w-24 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm transition-all relative group cursor-pointer border-2
                                    ${isRep 
                                      ? "border-[#c8aa6e] ring-2 ring-[#c8aa6e]/20" 
                                      : "border-[#e5e7eb] hover:border-gray-400"
                                    }`}
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    setActiveImagePopup(imgUrl); 
                                  }}
                                >
                                  <img 
                                    src={imgUrl} 
                                    alt={`현장 사진 ${idx + 1}`} 
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                                  />
                                  {isRep && (
                                    <span className="absolute bottom-1 right-1 bg-[#c8aa6e] text-[#0a1428] text-[8px] font-black px-1.5 py-0.5 rounded border border-[#0a1428]">
                                      대표
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 수정 버튼 */}
                      <div className="flex justify-end mt-4 pt-3 border-t border-gray-200/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            onEdit(diary);       
                          }}
                          className="flex items-center gap-1.5 text-xs font-black bg-[#0a1428] hover:bg-[#121c2c] text-[#f0e6d2] px-3.5 py-1.5 rounded-lg border border-[#c8aa6e] transition-all hover:scale-105 active:scale-[0.98] shadow-sm"
                        >
                          🔧 기록 수정
                        </button>
                      </div>

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

      <button
        onClick={onOpenModal} 
        className="fixed bottom-8 right-8 z-50 bg-[#0a1428] hover:bg-[#121c2c] text-[#f0e6d2] p-4 rounded-full shadow-2xl transition-transform hover:scale-110 border-2 border-[#c8aa6e]"
        title="오늘의 직관 기록하기"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* 이미지 라이트박스 팝업 */}
      {activeImagePopup && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setActiveImagePopup(null)} 
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <button 
              type="button"
              onClick={() => setActiveImagePopup(null)}
              className="absolute -top-12 right-0 text-white hover:text-[#c8aa6e] transition-colors p-1"
            >
              <X className="w-8 h-8 stroke-[2.5]" />
            </button>
            
            <img 
              src={activeImagePopup} 
              alt="직관 사진 원본" 
              className="max-w-full max-h-[82vh] rounded-lg object-contain shadow-2xl border border-white/10 cursor-default"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}

    </div>
  );
}