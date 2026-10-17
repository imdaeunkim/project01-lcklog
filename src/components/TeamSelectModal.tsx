import { useState } from 'react';
import { TEAMS } from '../data/teams';

interface TeamSelectModalProps {
  onSelect: (teamId: string) => void;
}

// 내 팀(응원팀) 선택 화면. 닫기 버튼 없음 → 팀을 골라야만 앱 사용 가능
export default function TeamSelectModal({ onSelect }: TeamSelectModalProps) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#c8aa6e] bg-[#0a1428] p-6 text-[#f0e6d2] shadow-2xl">
        <h2 className="text-xl font-black text-white">응원하는 팀을 골라주세요</h2>
        <p className="mt-1 text-xs text-[#9e9eb1]">직관 승률은 이 팀의 경기 결과로 계산돼요.</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => setPicked(team.id)}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                picked === team.id
                  ? 'border-[#c8aa6e] bg-[#c8aa6e] text-[#0a1428]'
                  : 'border-[#1e2837] bg-[#121c2c] hover:border-[#c8aa6e]'
              }`}
            >
              <span className="block text-[11px] opacity-70">{team.id}</span>
              {team.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => picked && onSelect(picked)}
          disabled={!picked}
          className="mt-5 w-full rounded-lg bg-[#c8aa6e] py-3 text-sm font-black text-[#0a1428] transition-opacity disabled:opacity-30"
        >
          이 팀으로 시작하기
        </button>
      </div>
    </div>
  );
}
