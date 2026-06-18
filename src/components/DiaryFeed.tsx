import React, { useState } from 'react';
import { MapPin, Trophy, Plus, MessageSquare } from 'lucide-react';

// 📦 부모(App.tsx)가 보낸 택배(Prop) 명세서
interface DiaryFeedProps {
  diaries: Array<{
    id: number;
    match: string;
    score: string;
    location: string;
    date: string;
    content: string;
    pom: string;
  }>;
  onOpenModal: () => void;
}

// 🎯 부모가 건네준 데이터와 리모컨을 받아옵니다!
export default function DiaryFeed({ diaries, onOpenModal }: DiaryFeedProps) {
  const [selectedId, setSelectedId] = useState<number | null>(1); 

  return (
    <div className="w-full text-[#111111] relative">
      
      {/* 피드 헤더 */}
      <div className="flex items-center justify-between border-b border-[#d1d5db] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#c8aa6e]" />
          <h2 className="text-lg font-black tracking-wide text-[#111111]">나의 직관 일기</h2>
        </div>
        <span className="text-xs font-bold text-[#6b7280] tracking-wider">{diaries.length}개의 기록</span>
      </div>

      {/* 일기 리스트 */}
      <div className="flex flex-col gap-5">
        {diaries.map((diary) => {
          const isSelected = selectedId === diary.id;

          return (
            <div 
              key={diary.id} 
              onClick={() => setSelectedId(diary.id)}
              className={`bg-white rounded-xl p-5 shadow-sm cursor-pointer transition-all duration-200 flex gap-5 items-start
                ${isSelected 
                  ? "border-2 border-[#c8aa6e] ring-4 ring-[#c8aa6e]/10 shadow-md transform -translate-y-0.5" 
                  : "border border-[#d1d5db] hover:border-[#9ca3af]" 
                }`}
            >
              {/* 🖼️ [왼쪽] 이미지 영역 */}
              <div className="shrink-0">
                <img 
                  src="https://placehold.co/180x180/f3f4f6/a7aaaf?text=MATCH+PHOTO" 
                  alt="경기 스크린샷" 
                  className="w-36 h-36 rounded-lg border border-[#e5e7eb] object-cover"
                />
              </div>

              {/* 📝 [오른쪽] 내용 영역 */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f3f4f6] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-black bg-[#0a1428] border border-[#c8aa6e] px-2.5 py-0.5 rounded text-[#f0e6d2]">
                      {diary.match}
                    </span>
                    <span className="text-xs font-black text-[#2255cc] bg-[#ecf2ff] px-2 py-0.5 rounded">
                      {diary.score}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#6b7280] ml-1">
                      <MapPin className="w-3.5 h-3.5 text-[#e84057]" />
                      <span>{diary.location}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#9ca3af]">{diary.date}</span>
                </div>

                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line font-medium">
                  "{diary.content}"
                </p>

                <div className="flex items-center gap-1.5 bg-[#f9fafb] border border-[#e5e7eb] w-fit px-3 py-1 rounded-md text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span className="text-[#6b7280]">오늘의 POM ·</span>
                  <span className="text-[#111111] font-black">{diary.pom}</span>
                </div>
              </div>
            </div>
          );
        })}
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