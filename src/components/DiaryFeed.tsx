import React, { useState } from 'react';
import { MapPin, Trophy, Plus, MessageSquare } from 'lucide-react';

export default function DiaryFeed() {
  // 어떤 일기를 선택(클릭)했는지 기억하는 저장 공간
  const [selectedId, setSelectedId] = useState<number | null>(1); // 기본값으로 첫 번째 카드 선택 강조

  const diaries = [
    {
      id: 1,
      match: "T1 vs DK",
      score: "2:1 WIN",
      location: "롤파크 (LoL PARK)",
      date: "2026.06.14",
      content: "2세트 한타에서 역전당할 뻔했는데 미드 갱킹 한 번으로 분위기 완전히 가져왔다. 현장에서 보니까 함성이 진짜 미쳤음. 오늘 직관 온 보람 100%. 페이커 갈리오 궁 들어가는 순간 소름 돋았다 진짜.",
      pom: "Faker"
    },
    {
      id: 2,
      match: "T1 vs HLE",
      score: "2:0 WIN",
      location: "인스파이어 아레나",
      date: "2026.06.11",
      content: "한화생명전 짜릿한 셧아웃 승리! 구마유시 바루스 킬각 잡는 피지컬 보고 입이 떡 벌어졌다. 좌석 시야도 너무 좋았고 직관 전승 신화는 계속된다 후후.",
      pom: "Gumayusi"
    }
  ];

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
              /* 🎯 레이아웃 변경: 내부 요소를 가로로 배치하기 위해 flex gap-5 추가 */
              className={`bg-white rounded-xl p-5 shadow-sm cursor-pointer transition-all duration-200 flex gap-5 items-start
                ${isSelected 
                  ? "border-2 border-[#c8aa6e] ring-4 ring-[#c8aa6e]/10 shadow-md transform -translate-y-0.5" 
                  : "border border-[#d1d5db] hover:border-[#9ca3af]" 
                }`}
            >
              
              {/* 🖼️ 1. [왼쪽] 임시 이미지 칸 배치 */}
              <div className="shrink-0"> {/* 이미지가 찌그러지지 않도록 크기 고정 */}
                <img 
                  /* 롤 공홈 감성의 회색톤 플레이스홀더 이미지 */
                  src="https://placehold.co/180x180/f3f4f6/a7aaaf?text=MATCH+PHOTO" 
                  alt="경기 스크린샷" 
                  /* 크기 설정 및 확실한 테두리 */
                  className="w-36 h-36 rounded-lg border border-[#e5e7eb] object-cover"
                />
              </div>

              {/* 📝 2. [오른쪽] 기존 글 내용 영역 (나머지 공간을 다 채움) */}
              <div className="flex-1 flex flex-col gap-3">
                {/* 상단 메타 바 */}
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

                {/* 본문 (이미지 오른쪽이라 mb-4 삭제) */}
                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line font-medium">
                  "{diary.content}"
                </p>

                {/* POM */}
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

      {/* 플로팅 버튼 (색상 반전: 다크 배경에 골드 테두리) */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-[#0a1428] hover:bg-[#121c2c] text-[#f0e6d2] p-4 rounded-full shadow-2xl transition-transform hover:scale-110 border-2 border-[#c8aa6e]"
        title="오늘의 직관 기록하기"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

    </div>
  );
}