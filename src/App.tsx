import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Plus } from 'lucide-react';
import type { Diary } from './types/diary';
import type { Profile } from './types/profile';
import { supabase } from './lib/supabase';
import { loadOrCreateProfile } from './lib/profile';
import { fetchDiaries, createDiary, updateDiary, deleteDiary, type DiaryInput } from './lib/diaries';
import ProfileHeader from "./components/ProfileHeader";
import SpectateCalendar from "./components/SpectateCalendar";
import DiaryFeed from "./components/DiaryFeed";
import DiaryFormModal from "./components/DiaryFormModal";
import LoginScreen from './components/LoginScreen';
import UserMenu from './components/UserMenu';
import ProfileEditModal from './components/ProfileEditModal';
import ConfirmDangerModal from './components/ConfirmDangerModal';
import { resetMyData, deleteMyAccount } from './lib/account';
import ReportCard from './components/ReportCard';
import { fetchReport, generateReport, ReportError, type Report } from './lib/report';

// 프로필 불러오기 결과. userId를 같이 기억해서 다른 계정의 결과와 섞이지 않게 함
interface ProfileState {
  userId: string;
  profile: Profile | null; // null이면 실패
}

// 일기 불러오기 결과. 프로필과 같은 방식
interface DiariesState {
  userId: string;
  diaries: Diary[] | null; // null이면 실패
}

// 승요 리포트 불러오기 결과. 프로필과 같은 방식
interface ReportState {
  userId: string;
  report: Report | null; // 저장된 리포트가 없으면 null
  loadFailed: boolean;
}

// 로그인 확인·프로필 불러오기 중에 보여주는 화면
function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a1428] p-4 text-center text-sm font-bold text-[#f0e6d2]">
      {children}
    </div>
  );
}

export default function App() {
  // 로그인 상태. authReady가 false면 아직 확인 중
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const userId = session?.user.id ?? null;

  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const [profileRetry, setProfileRetry] = useState(0); // 바꾸면 프로필을 다시 불러옴
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // 캘린더는 오늘이 속한 달부터 표시 (getMonth는 0부터 시작하므로 +1)
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null);
  const [diariesState, setDiariesState] = useState<DiariesState | null>(null);
  const [diariesRetry, setDiariesRetry] = useState(0); // 바꾸면 일기를 다시 불러옴
  const [reportState, setReportState] = useState<ReportState | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null); // 만들기 실패 안내
  // 열려 있는 위험 확인 창. null이면 닫힘
  const [dangerAction, setDangerAction] = useState<'reset' | 'deleteAccount' | null>(null);

  // 로그인·로그아웃 감지. 구독하자마자 현재 로그인 상태도 한 번 알려줌(INITIAL_SESSION)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // 로그인한 계정이 바뀌면 프로필을 불러옴 (처음 로그인이면 무작위 닉네임으로 생성)
  useEffect(() => {
    if (!userId) return;
    let ignore = false; // 응답 전에 계정이 바뀌거나 화면이 사라지면 이전 응답은 버림
    loadOrCreateProfile(userId)
      .then((profile) => {
        if (!ignore) setProfileState({ userId, profile });
      })
      .catch((e) => {
        console.error("프로필 로드 중 에러 발생:", e);
        if (!ignore) setProfileState({ userId, profile: null });
      });
    return () => { ignore = true; };
  }, [userId, profileRetry]);

  // 로그인한 계정이 바뀌면 그 계정의 일기를 DB에서 불러옴
  useEffect(() => {
    if (!userId) return;
    let ignore = false; // 응답 전에 계정이 바뀌면 이전 계정의 일기는 버림
    fetchDiaries(userId)
      .then((list) => {
        if (!ignore) setDiariesState({ userId, diaries: list });
      })
      .catch((e) => {
        console.error("일기 로드 중 에러 발생:", e);
        if (!ignore) setDiariesState({ userId, diaries: null });
      });
    return () => { ignore = true; };
  }, [userId, diariesRetry]);

  // 로그인한 계정이 바뀌면 저장된 승요 리포트를 불러옴 (새로 만들지는 않음)
  useEffect(() => {
    if (!userId) return;
    let ignore = false;
    fetchReport(userId)
      .then((report) => {
        if (!ignore) setReportState({ userId, report, loadFailed: false });
      })
      .catch((e) => {
        console.error("리포트 로드 중 에러 발생:", e);
        if (!ignore) setReportState({ userId, report: null, loadFailed: true });
      });
    return () => { ignore = true; };
  }, [userId]);

  // 화면의 일기 목록만 바꿈 (DB 저장은 호출하는 쪽에서 먼저 끝냄)
  const updateDiaryList = (change: (list: Diary[]) => Diary[]) => {
    setDiariesState((prev) => (prev?.diaries ? { ...prev, diaries: change(prev.diaries) } : prev));
    setReportError(null); // 일기가 바뀌면 지난 리포트 실패 안내("바뀐 일기 없음" 등)는 더 맞지 않음
  };

  // 수정 버튼 클릭 시 모달을 수정 모드로 오픈하는 함수
  const handleOpenEditModal = (diary: Diary) => {
    setEditingDiary(diary);
    setIsModalOpen(true);
  };

  // 저장 버튼 클릭 시. DB 저장에 성공했을 때만 화면에 반영하고 모달을 닫음.
  // 실패하면 모달을 닫지 않아서 작성한 내용이 그대로 남음
  const handleSaveDiary = async (input: DiaryInput) => {
    if (!userId) return;
    try {
      if (editingDiary) {
        const saved = await updateDiary(userId, editingDiary, input);
        updateDiaryList((list) => list.map((d) => (d.id === saved.id ? saved : d))); // 수정
      } else {
        const saved = await createDiary(userId, input);
        updateDiaryList((list) => [saved, ...list]); // 신규 작성은 맨 앞
      }
    } catch (e) {
      console.error("일기 저장 중 에러 발생:", e);
      alert("일기를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setIsModalOpen(false);
    setEditingDiary(null); // 수정 상태 초기화
  };

  // 삭제 버튼 클릭 시. 확인을 받은 뒤 DB에서 지우고, 성공하면 화면에서도 뺌
  const handleDeleteDiary = async (diary: Diary) => {
    if (!confirm(`${diary.date} ${diary.match.teamA} vs ${diary.match.teamB} 일기를 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)) return;
    try {
      await deleteDiary(diary); // 사진 파일도 함께 지움
    } catch (e) {
      console.error("일기 삭제 중 에러 발생:", e);
      alert("일기를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    updateDiaryList((list) => list.filter((d) => d.id !== diary.id));
  };

  //모달 닫을 시
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiary(null);
  };

  // 프로필 불러오기 실패 후 다시 시도
  const handleRetryProfile = () => {
    setProfileState(null);
    setProfileRetry((n) => n + 1);
  };

  // 일기 불러오기 실패 후 다시 시도
  const handleRetryDiaries = () => {
    setDiariesState(null);
    setDiariesRetry((n) => n + 1);
  };

  // 프로필 수정 성공. 새 프로필로 교체하면 승률·티어 등이 새 팀 기준으로 다시 계산됨
  const handleProfileSaved = (saved: Profile) => {
    if (userId) setProfileState({ userId, profile: saved });
    setIsProfileModalOpen(false);
  };

  // 리포트 만들기 버튼. 성공하면 새 리포트로 교체, 실패하면 안내만 띄우고 예전 리포트는 그대로 둠
  const handleGenerateReport = async () => {
    if (!userId) return;
    setIsGeneratingReport(true);
    setReportError(null);
    try {
      const report = await generateReport();
      setReportState({ userId, report, loadFailed: false });
    } catch (e) {
      setReportError(e instanceof ReportError ? e.message : '리포트를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 초기화. 일기·사진을 모두 지우고 팀을 "팀 없음"으로. 성공하면 화면도 빈 상태로 바꿈
  const handleReset = async () => {
    if (!userId) return;
    try {
      const profile = await resetMyData(userId);
      setDiariesState({ userId, diaries: [] });
      setProfileState({ userId, profile });
      setSelectedDate(null);
      setDangerAction(null);
    } catch (e) {
      console.error("초기화 중 에러 발생:", e);
      alert("초기화를 끝내지 못했습니다. 다시 시도하면 남은 것부터 이어서 지웁니다.");
      // 일부만 지워졌을 수 있으므로 일기를 다시 불러와 화면을 DB와 맞춤
      handleRetryDiaries();
    }
  };

  // 회원탈퇴. 성공하면 로그아웃되어 onAuthStateChange가 로그인 화면으로 바꿈
  const handleDeleteAccount = async () => {
    if (!userId) return;
    try {
      await deleteMyAccount(userId);
      setDangerAction(null);
    } catch (e) {
      console.error("회원탈퇴 중 에러 발생:", e);
      alert("회원탈퇴를 끝내지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  if (!authReady) {
    return <FullScreenMessage>불러오는 중…</FullScreenMessage>;
  }

  if (!userId) {
    return <LoginScreen />;
  }

  // 지금 계정의 결과가 아직 없으면 불러오는 중
  if (profileState?.userId !== userId) {
    return <FullScreenMessage>프로필을 불러오는 중…</FullScreenMessage>;
  }

  const profile = profileState.profile;
  if (!profile) {
    return (
      <FullScreenMessage>
        <p>프로필을 불러오지 못했습니다.</p>
        <button
          onClick={handleRetryProfile}
          className="rounded-lg bg-[#c8aa6e] px-4 py-2 text-xs font-black text-[#0a1428]"
        >
          다시 시도
        </button>
      </FullScreenMessage>
    );
  }

  // 지금 계정의 일기를 아직 못 받았으면 불러오는 중
  if (diariesState?.userId !== userId) {
    return <FullScreenMessage>일기를 불러오는 중…</FullScreenMessage>;
  }

  const diaries = diariesState.diaries;
  if (!diaries) {
    return (
      <FullScreenMessage>
        <p>일기를 불러오지 못했습니다.</p>
        <button
          onClick={handleRetryDiaries}
          className="rounded-lg bg-[#c8aa6e] px-4 py-2 text-xs font-black text-[#0a1428]"
        >
          다시 시도
        </button>
      </FullScreenMessage>
    );
  }

  const myTeam = profile.myTeam;
  // 다른 계정의 리포트가 섞이지 않게 지금 계정 것만 씀
  const currentReport = reportState?.userId === userId ? reportState : null;

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
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#9e9eb1] sm:block font-medium">
              나만을 위한 하이라이트 직관 기록
            </span>
            <UserMenu
              profile={profile}
              onEditProfile={() => setIsProfileModalOpen(true)}
              onReset={() => setDangerAction('reset')}
              onDeleteAccount={() => setDangerAction('deleteAccount')}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <ProfileHeader diaries={diaries} nickname={profile.nickname} tag={profile.tag} myTeam={myTeam} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SpectateCalendar
              diaries={diaries}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentYearMonth={currentYearMonth}
              setCurrentYearMonth={setCurrentYearMonth}
              myTeam={myTeam}
            />
            {/* 승요 리포트 (위치는 임시) */}
            <ReportCard
              diaries={diaries}
              myTeam={myTeam}
              report={currentReport?.report ?? null}
              loading={!currentReport}
              generating={isGeneratingReport}
              errorMessage={reportError ?? (currentReport?.loadFailed ? '저장된 리포트를 불러오지 못했어요.' : null)}
              onGenerate={handleGenerateReport}
            />
          </div>
          <div className="lg:col-span-3">
            <DiaryFeed
              diaries={diaries}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteDiary}
              myTeam={myTeam}
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
          myTeam={myTeam}
        />
      )}

      {/* 열 때마다 새로 만들어서 지금 프로필로 입력칸을 채움 */}
      {isProfileModalOpen && (
        <ProfileEditModal
          userId={userId}
          profile={profile}
          onClose={() => setIsProfileModalOpen(false)}
          onSaved={handleProfileSaved}
        />
      )}

      {dangerAction === 'reset' && (
        <ConfirmDangerModal
          title="초기화"
          confirmLabel="초기화"
          onConfirm={handleReset}
          onClose={() => setDangerAction(null)}
        >
          <p>직관 일기 {diaries.length}개와 첨부한 사진이 모두 지워지고, 응원팀이 "팀 없음"으로 바뀌어요.</p>
          <p className="mt-2">닉네임#태그와 계정은 그대로 남아요.</p>
        </ConfirmDangerModal>
      )}

      {dangerAction === 'deleteAccount' && (
        <ConfirmDangerModal
          title="회원탈퇴"
          confirmLabel="탈퇴하기"
          requiredText="동의합니다"
          onConfirm={handleDeleteAccount}
          onClose={() => setDangerAction(null)}
        >
          <p>계정과 함께 직관 일기, 사진, 프로필(닉네임#태그, 응원팀)이 모두 지워져요.</p>
          <p className="mt-2">같은 Google 계정으로 다시 로그인하면 새 계정으로 처음부터 시작해요.</p>
        </ConfirmDangerModal>
      )}
    </div>
  );
}
