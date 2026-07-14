import React, { useState } from 'react';
import ProfileHeader from "./components/ProfileHeader"
import SpectateCalendar from "./components/SpectateCalendar"
import DiaryFeed from "./components/DiaryFeed"
import DiaryFormModal from "./components/DiaryFormModal"

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState({ year: 2026, month: 6 });

  // 다이어리 원본 데이터 
  const [diaries, setDiaries] = useState([
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
  ]);

  const handleAddDiary = (newDiaryData: any) => {
    setDiaries([newDiaryData, ...diaries]);
    setIsModalOpen(false);
  };

  return (
    <div className="lck-root min-h-screen relative bg-[#f3f4f6]">
      <div className="sticky top-0 z-10 border-b border-[#c8aa6e] bg-[#0a1428] text-[#f0e6d2] shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[#c8aa6e] font-heading text-sm text-[#0a1428] font-black">
              LCK
            </span>
            <span className="font-heading text-lg tracking-tight text-white font-bold">
              직관 다이어리
            </span>
          </div>
          <span className="hidden text-xs text-[#9e9eb1] sm:block font-medium">
            나만을 위한 하이라이트 직관 기록
          </span>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <ProfileHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            {/* ⚡ [수정] 달력이 일기 데이터를 실시간으로 감시할 수 있도록 diaries를 배송합니다. */}
            <SpectateCalendar 
              diaries={diaries}
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
              currentYearMonth={currentYearMonth}
              setCurrentYearMonth={setCurrentYearMonth}
            />
          </div>
          <div className="lg:col-span-3">
            <DiaryFeed 
              diaries={diaries} 
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onOpenModal={() => setIsModalOpen(true)} 
            />
          </div>
        </div>
      </main>

      <DiaryFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddDiary} 
      />
    </div>
  )
}