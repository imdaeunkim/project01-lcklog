import React, { useState } from 'react';
import { X, Map as MapIcon, Image as ImageIcon, Crosshair } from 'lucide-react';

interface DiaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diary: any) => void; // 📦 확실하게 인터페이스에 추가!
}

// 📦 확실하게 괄호 안에 onSave 꺼내기!
export default function DiaryFormModal({ isOpen, onClose, onSave }: DiaryFormModalProps) {
  const [matchFormat, setMatchFormat] = useState<3 | 5>(3);

  const [date, setDate] = useState('2026-06-18');
  const [match, setMatch] = useState('T1 vs DK');
  const [score, setScore] = useState('');
  const [result, setResult] = useState('WIN');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [pom, setPom] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("오늘의 직관 일기를 작성해 주세요!");
      return;
    }

    const newDiary = {
      id: Date.now(),
      match: match,
      score: `${score} ${result}`, 
      location: location || "미지정 장소",
      date: date.replace(/-/g, '.'),
      content: content,
      pom: pom || "미지정"
    };

    onSave(newDiary); // 🚀 부모에게 성공적으로 배송!
    
    // 비워주기
    setScore('');
    setLocation('');
    setContent('');
    setPom('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-[#c8aa6e] shadow-2xl relative overflow-hidden">
        
        <div className="sticky top-0 bg-white border-b border-[#e5e7eb] px-6 py-4 flex justify-between items-start z-10">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-[#111111]">새로운 직관 기록 📝</h3>
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

            <div className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-lg p-4">
              <div className="flex justify-between text-xs font-black mb-3 px-2">
                <span className="text-[#2255cc]">BLUE TEAM</span>
                <span className="text-[#d93846]">RED TEAM</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {Array.from({ length: matchFormat }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between bg-white border border-[#e5e7eb] p-2 rounded-md">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((box) => (
                        <button key={`blue-${box}`} className="w-10 h-10 bg-[#ecf2ff] border border-[#b3ccff] rounded hover:bg-[#dbe4ff] flex items-center justify-center transition-colors group">
                          <PlusIcon className="w-4 h-4 text-[#2255cc] opacity-50 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                    <div className="text-xs font-black bg-[#0a1428] text-[#f0e6d2] px-3 py-1 rounded">
                      GAME {index + 1}
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((box) => (
                        <button key={`red-${box}`} className="w-10 h-10 bg-[#fff0f2] border border-[#ffd0d6] rounded hover:bg-[#ffe3e6] flex items-center justify-center transition-colors group">
                          <PlusIcon className="w-4 h-4 text-[#d93846] opacity-50 group-hover:opacity-100" />
                        </button>
                      ))}
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
                  <button className="bg-[#f3f4f6] border border-[#d1d5db] px-3 rounded-md flex items-center gap-1.5 hover:bg-[#e5e7eb] transition-colors">
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
              placeholder="직관 현장의 분위기, 잊지 못할 한타 명장면 등을 자유롭게 기록해 보세요!" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-[#d1d5db] rounded-md p-3 text-sm focus:outline-none focus:border-[#c8aa6e] resize-none leading-relaxed"
            ></textarea>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-black text-[#0a1428]">현장 사진 첨부</h4>
              <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded font-bold">선택</span>
            </div>
            <div className="w-full border-2 border-dashed border-[#d1d5db] rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-[#f9fafb] hover:border-[#c8aa6e] transition-colors cursor-pointer group">
              <div className="bg-[#f3f4f6] p-3 rounded-full group-hover:bg-[#f0e6d2] transition-colors">
                <ImageIcon className="w-6 h-6 text-[#6b7280] group-hover:text-[#c8aa6e]" />
              </div>
              <p className="text-sm font-bold text-[#6b7280]">클릭하거나 이미지를 드래그하여 업로드</p>
              <p className="text-xs text-[#9ca3af]">선수 사진, 티켓 인증샷 등 (최대 3장)</p>
            </div>
          </section>

        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#e5e7eb] p-4 z-10">
          <button 
            onClick={handleSubmit} 
            className="w-full bg-[#0a1428] text-[#f0e6d2] py-3.5 rounded-lg font-black hover:bg-[#121c2c] transition-colors border border-[#c8aa6e] shadow-md flex justify-center items-center gap-2"
          >
            다이어리에 기록 남기기
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