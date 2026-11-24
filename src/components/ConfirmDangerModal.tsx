import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ConfirmDangerModalProps {
  title: string;
  children: ReactNode; // 무엇이 지워지는지 설명
  confirmLabel: string;
  requiredText?: string; // 있으면 이 글자를 그대로 입력해야 버튼이 켜짐
  onConfirm: () => Promise<void>; // 끝나면 호출한 쪽이 모달을 닫음. 실패 안내도 호출한 쪽에서 함
  onClose: () => void;
}

// 되돌릴 수 없는 작업(초기화, 회원탈퇴)의 확인 창
export default function ConfirmDangerModal({ title, children, confirmLabel, requiredText, onConfirm, onClose }: ConfirmDangerModalProps) {
  const [typed, setTyped] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const canConfirm = !isWorking && (!requiredText || typed.trim() === requiredText);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsWorking(true);
    try {
      await onConfirm();
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#e84057] bg-[#0a1428] p-6 text-[#f0e6d2] shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white">{title}</h2>
          {/* 처리 중에는 닫지 못하게 막음 */}
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="p-1 text-[#9e9eb1] transition-colors hover:text-white disabled:opacity-30"
            aria-label="닫기"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="mt-4 text-sm leading-relaxed text-[#cdbe91]">{children}</div>
        <p className="mt-3 text-xs font-bold text-[#e84057]">이 작업은 되돌릴 수 없어요.</p>

        {requiredText && (
          <label className="mt-5 block">
            <span className="text-xs font-bold text-[#9e9eb1]">
              계속하려면 <span className="text-white">{requiredText}</span>를 입력해 주세요.
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={isWorking}
              placeholder={requiredText}
              className="mt-2 w-full rounded-lg border border-[#1e2837] bg-[#121c2c] px-3 py-2.5 text-sm font-bold text-white outline-none transition-colors placeholder:text-[#3c4656] focus:border-[#e84057] disabled:opacity-40"
            />
          </label>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="flex-1 rounded-lg border border-[#1e2837] py-3 text-sm font-black text-[#f0e6d2] transition-colors hover:bg-[#121c2c] disabled:opacity-30"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 rounded-lg bg-[#e84057] py-3 text-sm font-black text-white transition-opacity disabled:opacity-30"
          >
            {isWorking ? '처리 중…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
