import React, { useState, useRef, useEffect } from 'react';
import { X, Map as MapIcon, Image as ImageIcon, Crosshair } from 'lucide-react';
import { CHAMPIONS_LIST, CHAMPIONS_BY_POSITION } from "../data/champions";
import type { Champion } from "../data/champions";
import type { Diary, Match } from "../types/diary";
import { IMAGE_MAX_BYTES, IMAGE_TYPES, type DiaryInput } from "../lib/diaries";
import { getMatchesByDate, MatchLoadError } from "../data/matches";
import { getTeamShort } from "../data/teams";
import { getMyResult } from "../utils/matchResult";
import { compressImage } from "../utils/compressImage";
import ResultBadge from "./ResultBadge";
import imgTop from '../assets/positions/top.png';
import imgJungle from '../assets/positions/jungle.png';
import imgMid from '../assets/positions/mid.png';
import imgAdc from '../assets/positions/bot.png';
import imgSupport from '../assets/positions/sup.png';

type Position = "ALL" | "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

interface DiaryFormModalProps {
  onClose: () => void;
  onSave: (input: DiaryInput) => Promise<void>; // DB 저장이 끝나면 완료됨
  editingDiary: Diary | null;
  myTeam: string | null; // null이면 팀 없음
}

// 신규 작성 시 날짜 기본값: 오늘 (input type="date" 형식 YYYY-MM-DD)
function getTodayInputDate() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 내 팀 경기를 앞으로. 나머지는 원래 순서 유지 (sort는 같은 값끼리 순서를 바꾸지 않음)
// 내 팀이 출전한 경기인지 확인. 아직 안 끝난 경기도 포함
function isMyTeamMatch(m: Match, myTeam: string | null): boolean {
  return myTeam !== null && (m.teamA === myTeam || m.teamB === myTeam);
}

function sortMyTeamFirst(matches: Match[], myTeam: string | null): Match[] {
  const isMine = (m: Match) => (isMyTeamMatch(m, myTeam) ? 1 : 0);
  return [...matches].sort((a, b) => isMine(b) - isMine(a));
}

const MAX_IMAGES = 5;

// 모달에서 다루는 사진 하나. url은 미리보기 주소
// saved: 이미 Storage에 있는 사진(url은 1시간짜리 주소), new: 이번에 고른 파일(url은 브라우저 임시 주소)
type FormImage =
  | { kind: 'saved'; path: string; url: string }
  | { kind: 'new'; file: File; url: string };

interface ActiveSlot {
  gameIndex: number;
  team: 'blue' | 'red';
  boxIndex: number;
}

export default function DiaryFormModal({ onClose, onSave, editingDiary, myTeam }: DiaryFormModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position>("ALL");

  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null);
  // 모달은 열릴 때마다 새로 만들어지므로(App의 key 참고), 수정 모드면 기존 값으로, 신규면 기본값으로 초기화
  const [selectedChamps, setSelectedChamps] = useState<Record<string, { name: string; imageUrl: string }>>(
    () => editingDiary?.pickedChampions || {}
  );

  const [date, setDate] = useState(() => editingDiary ? editingDiary.date.replace(/\./g, '-') : getTodayInputDate());
  const dotDate = date.replace(/-/g, '.'); // 경기 데이터·Diary.date와 같은 "YYYY.MM.DD" 형식

  // 고른 날짜의 경기 목록. loadedDate가 지금 날짜와 다르면 아직 불러오는 중
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadedDate, setLoadedDate] = useState<string | null>(null);
  // 불러오기에 실패한 날짜와 이유. rateLimited면 요청 횟수 제한
  const [matchError, setMatchError] = useState<{ date: string; rateLimited: boolean } | null>(null);
  // "다시 시도"를 누를 때마다 1씩 늘려서 아래 useEffect를 다시 실행
  const [retryCount, setRetryCount] = useState(0);
  const isMatchError = loadedDate !== dotDate && matchError?.date === dotDate;
  const isLoadingMatches = loadedDate !== dotDate && !isMatchError;
  // 수정 모드면 저장된 경기, 신규면 목록을 불러온 뒤 첫 경기로 채움
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(editingDiary?.match ?? null);

  // 날짜가 바뀔 때마다 경기 목록을 다시 불러옴
  useEffect(() => {
    let ignore = false; // 응답 전에 날짜가 또 바뀌면 이전 응답은 버림
    getMatchesByDate(dotDate).then((list) => {
      if (ignore) return;
      const sorted = sortMyTeamFirst(list, myTeam);
      setMatches(sorted);
      setLoadedDate(dotDate);
      // 같은 날짜의 경기를 이미 골라 둔 상태(수정 모드)면 유지, 아니면 첫 경기 선택
      setSelectedMatch((prev) => (prev && prev.date === dotDate ? prev : sorted[0] ?? null));
    }).catch((error) => {
      if (ignore) return;
      console.error('경기 목록 불러오기 실패', error);
      setMatches([]);
      setMatchError({ date: dotDate, rateLimited: error instanceof MatchLoadError && error.rateLimited });
      // 수정 모드에서 저장해 둔 같은 날짜 경기는 유지 (목록 없이도 다시 저장 가능)
      setSelectedMatch((prev) => (prev && prev.date === dotDate ? prev : null));
    });
    return () => { ignore = true; };
  }, [dotDate, myTeam, retryCount]);

  const handleRetryMatches = () => {
    setMatchError(null); // 안내를 지우고 "불러오는 중"으로 바꿈
    setRetryCount((n) => n + 1);
  };

  // 저장된 경기가 지금 목록에 없을 수 있어서(예: 샘플 일기) 선택지에 따로 추가
  const matchOptions = selectedMatch && !matches.some((m) => m.id === selectedMatch.id)
    ? [selectedMatch, ...matches]
    : matches;
  const gameCount = selectedMatch?.format ?? 0;
  const [location, setLocation] = useState(editingDiary?.location ?? '');
  const [content, setContent] = useState(editingDiary?.content ?? '');
  const [pom, setPom] = useState(editingDiary?.pom ?? '');
  // 저장 요청 중이면 true. 버튼을 막아 같은 일기가 두 번 저장되는 것을 방지
  const [isSaving, setIsSaving] = useState(false);

  // 이미지 상태 관리. 수정 모드면 이미 올린 사진(경로 + 화면용 주소)으로 시작
  const [uploadedImages, setUploadedImages] = useState<FormImage[]>(
    () => editingDiary?.imagePaths.map((path, idx) => ({ kind: 'saved' as const, path, url: editingDiary.images[idx] })) ?? []
  );
  const [representativeIndex, setRepresentativeIndex] = useState<number>(editingDiary?.representativeIndex ?? 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 새 사진 미리보기용 임시 주소. 모달이 닫힐 때 모두 해제해서 메모리를 돌려줌
  const previewUrlsRef = useRef(new Set<string>());
  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  const filteredChampions = selectedPosition === "ALL"
    ? CHAMPIONS_LIST
    : CHAMPIONS_BY_POSITION[selectedPosition];

  // 사진을 줄이는 중이면 true. 그동안 사진 추가와 저장을 막음
  const [isPreparingImages, setIsPreparingImages] = useState(false);

  // 파일 선택 처리. 1MB가 넘으면 자동으로 줄임. 파일은 저장 버튼을 누를 때 Storage에 올림
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesArray = Array.from(e.target.files ?? []);
    e.target.value = ''; // 같은 파일을 지웠다가 다시 골라도 onChange가 오게 비움
    if (filesArray.length === 0) return;

    if (uploadedImages.length + filesArray.length > MAX_IMAGES) {
      alert(`사진은 최대 ${MAX_IMAGES}장까지만 등록할 수 있습니다.`);
      return;
    }

    setIsPreparingImages(true);
    const added: FormImage[] = [];
    for (const original of filesArray) {
      if (!IMAGE_TYPES.includes(original.type)) {
        alert(`"${original.name}"은 올릴 수 없는 형식입니다. JPG, PNG, WebP, GIF만 가능합니다.`);
        continue;
      }
      let file: File;
      try {
        file = await compressImage(original, IMAGE_MAX_BYTES);
      } catch (err) {
        console.error('사진 줄이기 실패:', original.name, err);
        alert(`"${original.name}" 사진을 준비하지 못했습니다. 다른 사진을 골라 주세요.`);
        continue;
      }
      // GIF는 줄이지 않으므로 여기서 걸러짐
      if (file.size > IMAGE_MAX_BYTES) {
        alert(`"${original.name}" GIF는 1MB 이하만 올릴 수 있습니다.`);
        continue;
      }
      const url = URL.createObjectURL(file);
      previewUrlsRef.current.add(url);
      added.push({ kind: 'new', file, url });
    }
    setUploadedImages((prev) => [...prev, ...added]);
    setIsPreparingImages(false);
  };

  // 대표 사진 지정. 고른 사진을 맨 앞으로 옮기고 나머지는 순서 유지 (대표 사진은 항상 첫 번째)
  // 예: [A, B, C, D]에서 C → [C, A, B, D]
  const handleSetRepresentative = (idx: number) => {
    if (idx !== 0) {
      const picked = uploadedImages[idx];
      setUploadedImages([picked, ...uploadedImages.filter((_, i) => i !== idx)]);
    }
    setRepresentativeIndex(0);
  };

  // 이미지 삭제 및 대표 인덱스 보정
  // 두 state를 따로 변경. updater 함수 안에서 다른 state를 바꾸면
  // 개발 모드(StrictMode)가 updater를 두 번 실행할 때 대표 인덱스가 두 번 줄어듦
  const handleDeleteImage = (indexToRemove: number) => {
    const removed = uploadedImages[indexToRemove];
    if (removed?.kind === 'new') {
      URL.revokeObjectURL(removed.url);
      previewUrlsRef.current.delete(removed.url);
    }
    const next = uploadedImages.filter((_, idx) => idx !== indexToRemove);
    setUploadedImages(next);

    setRepresentativeIndex((prevRepIdx) => {
      if (next.length === 0) return 0;
      if (indexToRemove === prevRepIdx) return 0;
      if (indexToRemove < prevRepIdx) return prevRepIdx - 1;
      return prevRepIdx;
    });
  };

  const handleSelectChampion = (champName: string, imageUrl: string) => {
    if (!activeSlot) return;
    
    const slotKey = `game${activeSlot.gameIndex}-${activeSlot.team}-${activeSlot.boxIndex}`;
    
    setSelectedChamps((prev) => ({
      ...prev,
      [slotKey]: { name: champName, imageUrl }
    }));

    setActiveSlot(null); 
  };

  const handleSubmit = async () => {
    if (isSaving || isPreparingImages) return;
    // 날짜를 바꾼 직후에는 selectedMatch가 아직 이전 날짜의 경기일 수 있음
    if (isLoadingMatches || !selectedMatch) {
      alert("직관한 경기를 선택해 주세요!");
      return;
    }
    if (!content.trim()) {
      alert("오늘의 직관 일기를 작성해 주세요!");
      return;
    }

    // 경기의 세트 수보다 뒤 세트의 밴픽은 버림 (예: 5판 경기를 골랐다가 3판 경기로 바꾼 경우)
    const picksInFormat = Object.fromEntries(
      Object.entries(selectedChamps).filter(([key]) => {
        const gameIdx = Number(key.match(/^game(\d+)-/)?.[1]);
        return gameIdx < selectedMatch.format;
      })
    );

    // 비어 있는 장소·POM은 null로 저장 (화면에 표시하지 않음)
    const input: DiaryInput = {
      match: selectedMatch,
      location: location.trim() || null,
      date: dotDate,
      content: content,
      pom: pom.trim() || null,
      pickedChampions: picksInFormat,
      images: uploadedImages.map((img) => (img.kind === 'saved' ? { kind: 'saved', path: img.path } : { kind: 'new', file: img.file })),
      representativeIndex: representativeIndex
    };

    // 성공하면 App이 모달을 닫음. 실패하면 App이 안내하고 모달은 그대로 남음
    setIsSaving(true);
    try {
      await onSave(input);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-[#c8aa6e] shadow-2xl relative overflow-hidden">
        
        <div className="sticky top-0 bg-white border-b border-[#e5e7eb] px-6 py-4 flex justify-between items-start z-10">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-[#111111]">
              {editingDiary ? "직관 기록 수정" : "새로운 직관 기록"}
            </h3>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 text-sm font-bold text-[#2255cc] bg-transparent border-none focus:outline-none cursor-pointer hover:bg-[#f3f4f6] rounded px-1 -ml-1 w-fit"
            />
          </div>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#111111] transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-8 text-[#111111]">
          
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-black text-[#0a1428]">경기 기본 정보</h4>
              <span className="text-[10px] bg-[#e84057] text-white px-1.5 py-0.5 rounded font-bold">필수</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#6b7280] mb-1">오늘의 매치업</label>
                {isLoadingMatches ? (
                  <div className="w-full border border-[#d1d5db] rounded-md p-2.5 text-sm font-bold text-[#9ca3af]">경기 불러오는 중…</div>
                ) : isMatchError && matchOptions.length === 0 ? (
                  <div className="w-full flex items-center justify-between gap-2 border border-[#ffd0d6] bg-[#fff0f2] rounded-md p-2.5 text-sm font-bold text-[#d93846]">
                    <span>
                      {matchError?.rateLimited
                        ? '요청이 많아 잠시 막혔어요. 몇 초 뒤 다시 시도해 주세요'
                        : '경기를 불러오지 못했어요'}
                    </span>
                    <button
                      type="button"
                      onClick={handleRetryMatches}
                      className="shrink-0 text-xs font-black bg-white border border-[#ffd0d6] rounded px-2 py-1 hover:bg-[#ffe4e8]"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : matchOptions.length === 0 ? (
                  <div className="w-full border border-dashed border-[#d1d5db] rounded-md p-2.5 text-sm font-bold text-[#9ca3af]">이 날짜에는 경기가 없음</div>
                ) : (
                  <select
                    value={selectedMatch?.id ?? ''}
                    onChange={(e) => setSelectedMatch(matchOptions.find((m) => m.id === e.target.value) ?? null)}
                    className="w-full border border-[#d1d5db] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#c8aa6e] font-bold"
                  >
                    {matchOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {isMyTeamMatch(m, myTeam) ? '⭐ ' : ''}{getTeamShort(m.teamA)} vs {getTeamShort(m.teamB)} (BO{m.format})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6b7280] mb-1">최종 결과</label>
                {/* 경기를 고르면 자동으로 표시. 내 팀 경기면 승패 아이콘 함께 표시 */}
                <div className="flex h-[42px] items-center justify-center gap-2 border border-[#e5e7eb] bg-[#f8f9fa] rounded-md text-sm font-black">
                  {selectedMatch && !isLoadingMatches ? (
                    <>
                      <span>{getTeamShort(selectedMatch.teamA)} {selectedMatch.scoreA} : {selectedMatch.scoreB} {getTeamShort(selectedMatch.teamB)}</span>
                      <ResultBadge result={getMyResult(selectedMatch, myTeam)} />
                    </>
                  ) : (
                    <span className="text-[#9ca3af]">-</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-[#f3f4f6]" />

          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-[#0a1428]">세트별 챔피언 픽</h4>
                <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded font-bold">선택</span>
              </div>
              {selectedMatch && (
                <span className="text-xs font-bold text-[#6b7280] bg-[#f3f4f6] rounded-lg px-3 py-1">BO{selectedMatch.format}</span>
              )}
            </div>

            <div className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-4 flex flex-col gap-4">
              <div className="flex justify-between text-xs font-black px-2">
                <span className="text-[#2255cc]">BLUE TEAM</span>
                <span className="text-[#d93846]">RED TEAM</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {gameCount === 0 && (
                  <p className="text-center text-xs font-bold text-[#9ca3af] py-2">경기를 먼저 선택해 주세요</p>
                )}
                {Array.from({ length: gameCount }).map((_, gameIdx) => (
                  <div key={gameIdx} className="flex items-center justify-between bg-white border border-[#e5e7eb] p-2 rounded-md">
                    
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((box) => {
                        const currentKey = `game${gameIdx}-blue-${box}`;
                        const hasChamp = selectedChamps[currentKey];
                        const isCurrentlyActive = activeSlot?.gameIndex === gameIdx && activeSlot?.team === 'blue' && activeSlot?.boxIndex === box;
                        
                        return (
                          <div key={`blue-${box}`} className="relative">
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedPosition("ALL"); 
                                setActiveSlot({ gameIndex: gameIdx, team: 'blue', boxIndex: box });
                              }}
                              className={`w-10 h-10 bg-[#ecf2ff] border rounded hover:bg-[#dbe4ff] flex items-center justify-center transition-colors overflow-hidden relative group ${
                                isCurrentlyActive ? "border-[#c8aa6e] ring-2 ring-[#c8aa6e]/30" : "border-[#b3ccff]"
                              }`}
                            >
                              {hasChamp ? (
                                <img src={hasChamp.imageUrl} alt={hasChamp.name} className="w-full h-full object-cover" />
                              ) : (
                                <PlusIcon className="w-4 h-4 text-[#2255cc] opacity-50 group-hover:opacity-100" />
                              )}
                            </button>

                            {isCurrentlyActive && (
                              <div className="absolute bottom-12 left-0 w-64 bg-white border-2 border-[#c8aa6e] rounded-xl p-3 shadow-xl z-30 animate-fadeIn">
                                <div className="flex justify-between items-center mb-2 border-b pb-1">
                                  <span className="text-[10px] font-black text-[#0a1428]">블루 {box}번 선택</span>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setActiveSlot(null); }} className="text-gray-400 hover:text-black">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <ChampionPickerSelect onSelect={handleSelectChampion} filteredChampions={filteredChampions} selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs font-black bg-[#0a1428] text-[#f0e6d2] px-3 py-1 rounded">
                      GAME {gameIdx + 1}
                    </div>

                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((box) => {
                        const currentKey = `game${gameIdx}-red-${box}`;
                        const hasChamp = selectedChamps[currentKey];
                        const isCurrentlyActive = activeSlot?.gameIndex === gameIdx && activeSlot?.team === 'red' && activeSlot?.boxIndex === box;

                        return (
                          <div key={`red-${box}`} className="relative">
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedPosition("ALL"); 
                                setActiveSlot({ gameIndex: gameIdx, team: 'red', boxIndex: box });
                              }}
                              className={`w-10 h-10 bg-[#fff0f2] border rounded hover:bg-[#ffe3e6] flex items-center justify-center transition-colors overflow-hidden relative group ${
                                isCurrentlyActive ? "border-[#c8aa6e] ring-2 ring-[#c8aa6e]/30" : "border-[#ffd0d6]"
                              }`}
                            >
                              {hasChamp ? (
                                <img src={hasChamp.imageUrl} alt={hasChamp.name} className="w-full h-full object-cover" />
                              ) : (
                                <PlusIcon className="w-4 h-4 text-[#d93846] opacity-50 group-hover:opacity-100" />
                              )}
                            </button>

                            {isCurrentlyActive && (
                              <div className="absolute bottom-12 right-0 w-64 bg-white border-2 border-[#c8aa6e] rounded-xl p-3 shadow-xl z-30 animate-fadeIn">
                                <div className="flex justify-between items-center mb-2 border-b pb-1">
                                  <span className="text-[10px] font-black text-[#0a1428]">레드 {box}번 선택</span>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setActiveSlot(null); }} className="text-gray-400 hover:text-black">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <ChampionPickerSelect onSelect={handleSelectChampion} filteredChampions={filteredChampions} selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </section>

          <hr className="border-[#f3f4f6]" />

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs font-bold text-[#6b7280]">경기 장소</label>
                  <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded font-bold">선택</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="예: 롤파크" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 border border-[#d1d5db] rounded-md p-2 text-sm focus:outline-none focus:border-[#c8aa6e]" 
                  />
                  <button type="button" className="bg-[#f3f4f6] border border-[#d1d5db] px-3 rounded-md flex items-center gap-1.5 hover:bg-[#e5e7eb] transition-colors">
                    <MapIcon className="w-4 h-4 text-[#4b5563]" />
                    <span className="text-xs font-bold text-[#4b5563]">지도 검색</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs font-bold text-[#6b7280]">오늘의 POM</label>
                  <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded font-bold">선택</span>
                </div>
                <div className="relative">
                  <Crosshair className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <input 
                    type="text" 
                    placeholder="오늘 가장 빛났던 선수는?" 
                    value={pom}
                    onChange={(e) => setPom(e.target.value)}
                    className="w-full border border-[#d1d5db] rounded-md pl-9 p-2 text-sm focus:outline-none focus:border-[#c8aa6e]" 
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-[#f3f4f6]" />

          <section>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-black text-[#0a1428]">오늘의 직관 일기</h4>
              <span className="text-[10px] bg-[#e84057] text-white px-1.5 py-0.5 rounded font-bold">필수</span>
            </div>
            <textarea 
              rows={5} 
              placeholder="직관 현장 분위기 작성" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-[#d1d5db] rounded-md p-3 text-sm focus:outline-none focus:border-[#c8aa6e] resize-none leading-relaxed"
            ></textarea>
          </section>

          {/* 이미지 업로드 및 대표 설정 구역 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-black text-[#0a1428]">현장 사진 첨부</h4>
              <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded font-bold">
                {isPreparingImages ? "사진 준비 중…" : `선택 (${uploadedImages.length}/${MAX_IMAGES})`}
              </span>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              accept={IMAGE_TYPES.join(',')}
              multiple 
              onChange={handleImageChange} 
              className="hidden" 
            />

            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-5 gap-3 p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                {uploadedImages.map((img, idx) => {
                  const isRep = idx === representativeIndex;
                  return (
                    <div
                      key={img.kind === 'saved' ? img.path : img.url}
                      onClick={() => handleSetRepresentative(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group shadow-sm
                        ${isRep 
                          ? "border-[#c8aa6e] ring-2 ring-[#c8aa6e]/20" 
                          : "border-transparent hover:border-gray-400"
                        }`}
                    >
                      <img src={img.url} alt={`업로드 이미지 ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {isRep ? (
                        <span className="absolute top-1 left-1 bg-[#c8aa6e] text-[#0a1428] text-[8px] font-black px-1.5 py-0.5 rounded border border-[#0a1428] z-10">
                          대표
                        </span>
                      ) : (
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[9px] text-white font-black bg-black/60 px-1.5 py-1 rounded">대표 설정</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleDeleteImage(idx);
                        }}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-[#d93846] text-white p-1 rounded-full transition-colors z-20"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                
                {uploadedImages.length < MAX_IMAGES && (
                  <button
                    type="button"
                    disabled={isPreparingImages}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-[#d1d5db] hover:border-[#c8aa6e] rounded-lg flex flex-col items-center justify-center gap-1 bg-white hover:bg-gray-50 transition-colors group"
                  >
                    <PlusIcon className="w-5 h-5 text-gray-400 group-hover:text-[#c8aa6e]" />
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#c8aa6e]">추가</span>
                  </button>
                )}
              </div>
            ) : (
              <div 
                onClick={() => { if (!isPreparingImages) fileInputRef.current?.click(); }}
                className="w-full border-2 border-dashed border-[#d1d5db] rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-[#f9fafb] hover:border-[#c8aa6e] transition-colors cursor-pointer group"
              >
                <div className="bg-[#f3f4f6] p-3 rounded-full group-hover:bg-[#f0e6d2] transition-colors">
                  <ImageIcon className="w-6 h-6 text-[#6b7280] group-hover:text-[#c8aa6e]" />
                </div>
                <p className="text-sm font-bold text-[#6b7280] group-hover:text-[#c8aa6e]">현장 사진 첨부</p>
                <p className="text-xs text-[#9ca3af]">최대 5장 (큰 사진은 자동으로 줄여서 올림)</p>
              </div>
            )}
          </section>

        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#e5e7eb] p-4 z-10">
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isPreparingImages}
            className="w-full bg-[#0a1428] text-[#f0e6d2] py-3.5 rounded-lg font-black hover:bg-[#121c2c] transition-colors border border-[#c8aa6e] shadow-md flex justify-center items-center gap-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "저장 중…" : isPreparingImages ? "사진 준비 중…" : editingDiary ? "기록 수정 완료" : "다이어리에 기록 남기기"}
          </button>
        </div>

      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

function ChampionPickerSelect({ 
  onSelect, 
  filteredChampions, 
  selectedPosition, 
  setSelectedPosition 
}: { 
  onSelect: (name: string, url: string) => void;
  filteredChampions: Champion[];
  selectedPosition: Position;
  setSelectedPosition: (pos: Position) => void;
}) {
  return (
    <div>
      <div className="flex justify-center gap-1.5 mb-2 bg-[#f3f4f6] p-1.5 rounded-lg border border-gray-200">
        {([
          { id: "ALL", label: "전체", url: null },
          { id: "TOP", label: "탑", url: imgTop },
          { id: "JUNGLE", label: "정글", url: imgJungle },
          { id: "MID", label: "미드", url: imgMid },
          { id: "ADC", label: "원딜", url: imgAdc },
          { id: "SUPPORT", label: "서폿", url: imgSupport }
        ] as { id: Position; label: string; url: string | null }[]).map((pos) => (
          <button
            key={pos.id}
            type="button"
            className={`w-7 h-7 rounded-md transition-all flex items-center justify-center ${
              selectedPosition === pos.id 
                ? "bg-[#0a1428] text-[#f0e6d2] scale-105" 
                : "bg-transparent hover:bg-gray-200"
            }`}
            onClick={(e) => { e.stopPropagation(); setSelectedPosition(pos.id); }}
          >
            {pos.id === "ALL" ? (
              <span className={`text-[10px] font-black ${selectedPosition === "ALL" ? "text-[#f0e6d2]" : "text-gray-500"}`}>전체</span>
            ) : (
              <img src={pos.url ?? undefined} alt={pos.label} className={`w-5 h-5 object-contain ${selectedPosition === pos.id ? "brightness-150" : "opacity-60"}`} />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-[#f9fafb] border border-gray-100 rounded-lg">
        {filteredChampions.map((champ) => (
          <button
            key={champ.id}
            type="button"
            className="flex flex-col items-center p-1 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-[#c8aa6e] transition-all"
            onClick={() => onSelect(champ.name, champ.imageUrl)}
          >
            <img src={champ.imageUrl} alt={champ.name} className="w-6 h-6 rounded" />
            <span className="text-[9px] mt-0.5 font-bold text-gray-500 truncate w-full text-center">{champ.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}