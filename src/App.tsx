import React, { useState, useEffect } from 'react';
import type { Diary } from '../types/diary'; 
import ProfileHeader from "./components/ProfileHeader";
import SpectateCalendar from "./components/SpectateCalendar";
import DiaryFeed from "./components/DiaryFeed";
import DiaryFormModal from "./components/DiaryFormModal";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState({ year: 2026, month: 6 });
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  // diary 초기값 세팅
  const [diaries, setDiaries] = useState<Diary[]>(() => {
    const savedDiaries = localStorage.getItem('lol-diaries');
    if (savedDiaries) {
      try {
        return JSON.parse(savedDiaries);
      } catch (e) {
        console.error("데이터 로드 중 에러 발생:", e);
      }
    }
    //dummy data 
    return [
      {
        id: 1,
        match: "T1 vs DK",
        score: "2:1",
        result: "WIN",
        location: "롤파크 (LoL PARK)",
        date: "2026.06.14",
        content: "2세트 한타에서 역전당할 뻔했는데 미드 갱킹 한 번으로 분위기 완전히 가져왔다. 현장에서 보니까 함성이 진짜 미쳤음. 오늘 직관 온 보람 100%. 페이커 갈리오 궁 들어가는 순간 소름 돋았다 진짜.",
        pom: "Faker",
        pickedChampions: ["Aatrox", "LeeSin", "Taliyah", "Senna", "Nautilus", "Kenia", "Sejuani", "Azir", "Lucian", "Nami"]
      },
      {
        id: 2,
        match: "T1 vs HLE",
        score: "2:0",
        result: "WIN",
        location: "인스파이어 아레나",
        date: "2026.06.11",
        content: "한화생명전 짜릿한 셧아웃 승리! 구마유시 바루스 킬각 잡는 피지컬 보고 입이 떡 벌어졌다. 좌석 시야도 너무 좋았고 직관 전승 신화는 계속된다 후후.",
        pom: "Gumayusi",
        pickedChampions: ["Gnar", "Viego", "Azir", "Varus", "Ashe", "Jax", "Maokai", "Taliyah", "Kalista", "Rell"]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lol-diaries', JSON.stringify(diaries));
  }, [diaries]);

  // 수정 버튼 클릭 시 모달을 수정 모드로 오픈하는 함수
  const handleOpenEditModal = (diary: any) => {
    setEditingDiary(diary); 
    setIsModalOpen(true);   
  };

  // 저장 버튼 클릭 시
  const handleSaveDiary = (diaryData: any) => {
    if (editingDiary) {
      // 수정 
      setDiaries(diaries.map(d => d.id === editingDiary.id ? diaryData : d));
    } else {
      // 신규 작성 
      setDiaries([diaryData, ...diaries]);
    }
    setIsModalOpen(false);
    setEditingDiary(null); // 수정 상태 초기화
  };

  //모달 닫을 시 
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiary(null); 
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
        <ProfileHeader diaries={diaries} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
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
              onEdit={handleOpenEditModal} 
            />
          </div>
        </div>
      </main>

      <DiaryFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveDiary} 
        editingDiary={editingDiary}
      />
    </div>
  );
}