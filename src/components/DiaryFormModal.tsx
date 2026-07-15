import React, { useState, useEffect, useRef } from 'react';
import { X, Map as MapIcon, Image as ImageIcon, Crosshair } from 'lucide-react';
import { CHAMPIONS_LIST } from "../data/champions";
import imgTop from '../assets/positions/top.png';
import imgJungle from '../assets/positions/jungle.png';
import imgMid from '../assets/positions/mid.png';
import imgAdc from '../assets/positions/bot.png';
import imgSupport from '../assets/positions/sup.png';

type Position = "ALL" | "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

interface DiaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diary: any) => void;
  editingDiary?: any | null; 
}

interface ActiveSlot {
  gameIndex: number;
  team: 'blue' | 'red';
  boxIndex: number;
}

export default function DiaryFormModal({ isOpen, onClose, onSave, editingDiary }: DiaryFormModalProps) {
  const [matchFormat, setMatchFormat] = useState<3 | 5>(3);
  const [selectedPosition, setSelectedPosition] = useState<Position>("ALL");

  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null);
  const [selectedChamps, setSelectedChamps] = useState<Record<string, { name: string; imageUrl: string }>>({});

  const [date, setDate] = useState('2026-06-18');
  const [match, setMatch] = useState('T1 vs DK');
  const [score, setScore] = useState('');
  const [result, setResult] = useState('WIN');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [pom, setPom] = useState('');

  // 이미지 상태 관리
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [representativeIndex, setRepresentativeIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달 오픈 시 수정/신규 데이터 바인딩
  useEffect(() => {
    if (isOpen) {
      if (editingDiary) {
        setDate(editingDiary.date.replace(/\./g, '-')); 
        setMatch(editingDiary.match);
        setScore(editingDiary.score === "0:0" ? "" : editingDiary.score);
        setResult(editingDiary.result);
        setLocation(editingDiary.location === "미지정 장소" ? "" : editingDiary.location);
        setContent(editingDiary.content);
        setPom(editingDiary.pom === "미지정" ? "" : editingDiary.pom);
        setSelectedChamps(editingDiary.pickedChampions || {});
        setUploadedImages(editingDiary.images || (editingDiary.image ? [editingDiary.image] : []));
        setRepresentativeIndex(editingDiary.representativeIndex ?? 0);
      } else {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        setDate(`${y}-${m}-${d}`);
        
        setMatch('T1 vs DK');
        setScore('');
        setResult('WIN');
        setLocation('');
        setContent('');
        setPom('');
        setSelectedChamps({});
        setUploadedImages([]);
        setRepresentativeIndex(0);
      }
    }
  }, [isOpen, editingDiary]);

  const filteredChampions = CHAMPIONS_LIST.filter((champ) => {
    if (selectedPosition === "ALL") return true;
    return champ.positions.includes(selectedPosition);
  });

  if (!isOpen) return null;

  // 파일 업로드 처리 (용량 제한 1MB)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const filesArray = Array.from(files);
      
      if (uploadedImages.length + filesArray.length > 5) {
        alert("사진은 최대 5장까지만 등록할 수 있습니다.");
        return;
      }

      filesArray.forEach((file) => {
        if (file.size > 1 * 1024 * 1024) {
          alert(`"${file.name}" 사진 용량이 1MB를 초과합니다.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 이미지 삭제 및 대표 인덱스 보정
  const handleDeleteImage = (indexToRemove: number) => {
    setUploadedImages((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      
      setRepresentativeIndex((prevRepIdx) => {
        if (next.length === 0) return 0;
        if (indexToRemove === prevRepIdx) return 0;
        if (indexToRemove < prevRepIdx) return prevRepIdx - 1;
        return prevRepIdx;
      });

      return next;
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

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("오늘의 직관 일기를 작성해 주세요!");
      return;
    }

    const newDiary = {
      id: editingDiary ? editingDiary.id : Date.now(),
      match: match,
      score: score.trim() || "0:0", 
      result: result,               
      location: location || "미지정 장소",
      date: date.replace(/-/g, '.'),
      content: content,
      pom: pom || "미지정",
      pickedChampions: selectedChamps,
      image: uploadedImages[representativeIndex] || null, 
      images: uploadedImages,
      representativeIndex: representativeIndex
    };

    onSave(newDiary);
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
                <select 
                  value={match}
                  onChange={(e) => setMatch(e.target.value)}
                  className="w-full border border-[#d1d5db] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#c8aa6e] font-bold"
                >
                  <option value="T1 vs DK" className="font-bold text-[#2255cc]">⭐ [오늘] T1 vs DK</option>
                  <option value="GEN vs HLE">GEN vs HLE</option>
                  <option value="KT vs KDF">KT vs KDF</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6b7280] mb-1">최종 결과</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="예: 2:1" 
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-1/2 border border-[#d1d5db] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#c8aa6e] text-center font-black" 
                  />
                  <select 
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-1/2 border border-[#d1d5db] rounded-md p-2.5 text-sm focus:outline-none focus:border-[#c8aa6e] font-bold"
                  >
                    <option value="WIN" className="text-[#2255cc]">WIN</option>
                    <option value="LOSE" className="text-[#d93846]">LOSE</option>
                  </select>
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
              <div className="flex bg-[#f3f4f6] rounded-lg p-1">
                <button onClick={() => setMatchFormat(3)} className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${matchFormat === 3 ? 'bg-white shadow-sm text-[#111111]' : 'text-[#6b7280]'}`}>BO3</button>
                <button onClick={() => setMatchFormat(5)} className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${matchFormat === 5 ? 'bg-white shadow-sm text-[#111111]' : 'text-[#6b7280]'}`}>BO5</button>
              </div>
            </div>

            <div className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-4 flex flex-col gap-4">
              <div className="flex justify-between text-xs font-black px-2">
                <span className="text-[#2255cc]">BLUE TEAM</span>
                <span className="text-[#d93846]">RED TEAM</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {Array.from({ length: matchFormat }).map((_, gameIdx) => (
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
                선택 ({uploadedImages.length}/5)
              </span>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              onChange={handleImageChange} 
              className="hidden" 
            />

            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-5 gap-3 p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-lg">
                {uploadedImages.map((imgUrl, idx) => {
                  const isRep = idx === representativeIndex;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setRepresentativeIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group shadow-sm
                        ${isRep 
                          ? "border-[#c8aa6e] ring-2 ring-[#c8aa6e]/20" 
                          : "border-transparent hover:border-gray-400"
                        }`}
                    >
                      <img src={imgUrl} alt={`업로드 이미지 ${idx + 1}`} className="w-full h-full object-cover" />
                      
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
                
                {uploadedImages.length < 5 && (
                  <button
                    type="button"
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
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#d1d5db] rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-[#f9fafb] hover:border-[#c8aa6e] transition-colors cursor-pointer group"
              >
                <div className="bg-[#f3f4f6] p-3 rounded-full group-hover:bg-[#f0e6d2] transition-colors">
                  <ImageIcon className="w-6 h-6 text-[#6b7280] group-hover:text-[#c8aa6e]" />
                </div>
                <p className="text-sm font-bold text-[#6b7280] group-hover:text-[#c8aa6e]">현장 사진 첨부</p>
                <p className="text-xs text-[#9ca3af]">최대 5장 (장당 1MB 이하)</p>
              </div>
            )}
          </section>

        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#e5e7eb] p-4 z-10">
          <button 
            type="button"
            onClick={handleSubmit} 
            className="w-full bg-[#0a1428] text-[#f0e6d2] py-3.5 rounded-lg font-black hover:bg-[#121c2c] transition-colors border border-[#c8aa6e] shadow-md flex justify-center items-center gap-2"
          >
            {editingDiary ? "기록 수정 완료" : "다이어리에 기록 남기기"}
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
  filteredChampions: any[];
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
        ] as { id: Position; label: string; url: any }[]).map((pos) => (
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
              <img src={pos.url} alt={pos.label} className={`w-5 h-5 object-contain ${selectedPosition === pos.id ? "brightness-150" : "opacity-60"}`} />
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