interface ResultBadgeProps {
  result: 'WIN' | 'LOSE' | null;
  size?: 'sm' | 'md';
}

// 내 팀 기준 승패 표시. 승패 아이콘은 이 컴포넌트에서만 그림
// 나중에 팀 마스코트·로고로 바꿀 때 이 파일만 수정
// result가 null(내 팀 경기 아님)이면 아무것도 그리지 않음
export default function ResultBadge({ result, size = 'md' }: ResultBadgeProps) {
  if (!result) return null;

  const isWin = result === 'WIN';
  const sizeClass = size === 'sm' ? 'size-3.5 text-[8px]' : 'size-5 text-[11px]';
  const colorClass = isWin
    ? 'bg-[#2255cc] text-white'
    : 'bg-[#d93846] text-white';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded font-black leading-none ${sizeClass} ${colorClass}`}
      title={isWin ? '내 팀 승리' : '내 팀 패배'}
    >
      {isWin ? 'W' : 'L'}
    </span>
  );
}
