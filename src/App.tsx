import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Diary } from './types/diary';
import { CHAMPIONS_LIST } from './data/champions';
import ProfileHeader from "./components/ProfileHeader";
import SpectateCalendar from "./components/SpectateCalendar";
import DiaryFeed from "./components/DiaryFeed";
import DiaryFormModal from "./components/DiaryFormModal";

const STORAGE_KEY = 'lol-diaries';

// 샘플 일기용: 챔피언 id 목록을 실제 저장 형식(game0-blue-1 ...)으로 변환. 1세트만 채움
function buildSamplePicks(blueIds: string[], redIds: string[]): Diary['pickedChampions'] {
  const picks: NonNullable<Diary['pickedChampions']> = {};
  const fill = (team: 'blue' | 'red', ids: string[]) => {
    ids.forEach((id, idx) => {
      const champ = CHAMPIONS_LIST.find((c) => c.id === id);
      if (champ) picks[`game0-${team}-${idx + 1}`] = { name: champ.name, imageUrl: champ.imageUrl };
    });
  };
  fill('blue', blueIds);
  fill('red', redIds);
  return picks;
}

// localStorage에 저장. 용량 초과 등으로 실패하면 false 반환
function saveToStorage(diaries: Diary[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diaries));
    return true;
  } catch (e) {
    console.error("데이터 저장 중 에러 발생:", e);
    return false;
  }
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // 캘린더는 오늘이 속한 달부터 표시 (getMonth는 0부터 시작하므로 +1)
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  // diary 초기값 세팅
  const [diaries, setDiaries] = useState<Diary[]>(() => {
    const savedDiaries = localStorage.getItem(STORAGE_KEY);
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
        matchFormat: 3,
        pickedChampions: buildSamplePicks(["Aatrox", "LeeSin", "Taliyah", "Senna", "Nautilus"], ["Jax", "Sejuani", "Azir", "Lucian", "Nami"])
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
        matchFormat: 3,
        pickedChampions: buildSamplePicks(["Gnar", "Viego", "Azir", "Varus", "Ashe"], ["Jax", "Maokai", "Taliyah", "Kalista", "Rell"])
      }
    ];
  });

  // 수정 버튼 클릭 시 모달을 수정 모드로 오픈하는 함수
  const handleOpenEditModal = (diary: Diary) => {
    setEditingDiary(diary); 
    setIsModalOpen(true);   
  };

  // 저장 버튼 클릭 시
  const handleSaveDiary = (diaryData: Diary) => {
    const nextDiaries = editingDiary
      ? diaries.map(d => d.id === editingDiary.id ? diaryData : d) // 수정
      : [diaryData, ...diaries]; // 신규 작성

    // 저장소에 먼저 저장해 보고, 성공했을 때만 화면에 반영.
    // 실패하면 모달을 닫지 않아서 작성한 내용이 그대로 남음
    if (!saveToStorage(nextDiaries)) {
      alert("저장 공간이 부족해서 저장하지 못했습니다. 사진 수를 줄이거나 다른 일기의 사진을 지운 뒤 다시 시도해 주세요.");
      return;
    }
    setDiaries(nextDiaries);
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
              onEdit={handleOpenEditModal} 
            />
          </div>
        </div>
      </main>

      {/* 새 일기 작성 버튼 (화면 오른쪽 아래에 고정) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#0a1428] hover:bg-[#121c2c] text-[#f0e6d2] p-4 rounded-full shadow-2xl transition-transform hover:scale-110 border-2 border-[#c8aa6e]"
        title="오늘의 직관 기록하기"
      >
        <Plus className="size-6 stroke-[3]" />
      </button>

      {/* 열려 있을 때만 렌더링. key가 바뀌면(다른 일기 수정) 모달을 새로 만들어 초기값을 다시 채움 */}
      {isModalOpen && (
        <DiaryFormModal 
          key={editingDiary?.id ?? 'new'}
          onClose={handleCloseModal} 
          onSave={handleSaveDiary} 
          editingDiary={editingDiary}
        />
      )}
    </div>
  );
}