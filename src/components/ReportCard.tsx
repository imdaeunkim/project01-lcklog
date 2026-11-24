import { Sparkles, RefreshCw } from 'lucide-react';
import type { Diary } from '../types/diary';
import type { Report } from '../lib/report';
import { MIN_DIARIES_FOR_REPORT, hasDiaryChanges } from '../lib/report';
import { getWinStats } from '../utils/matchResult';
import { getTeamName } from '../data/teams';

interface ReportCardProps {
  diaries: Diary[];
  myTeam: string | null;
  report: Report | null; // 저장된 리포트. 없으면 null
  loading: boolean; // 저장된 리포트를 불러오는 중
  generating: boolean; // 새 리포트를 만드는 중
  errorMessage: string | null; // 생성·불러오기 실패 안내
  onGenerate: () => void;
}

// 가장 많이 본 팀 (응원팀 제외). 기록이 없으면 null
function getMostWatchedTeam(diaries: Diary[], myTeam: string | null): { name: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const { match } of diaries) {
    for (const team of [match.teamA, match.teamB]) {
      if (team !== myTeam) counts.set(team, (counts.get(team) ?? 0) + 1);
    }
  }
  let best: { name: string; count: number } | null = null;
  for (const [team, count] of counts) {
    if (!best || count > best.count) best = { name: getTeamName(team), count };
  }
  return best;
}

// 리포트가 없거나 실패했을 때 대신 보여주는 기본 통계 (앱에서 바로 계산)
function BasicStats({ diaries, myTeam }: { diaries: Diary[]; myTeam: string | null }) {
  const { total, wins, losses, rate } = getWinStats(diaries, myTeam);
  const mostWatched = getMostWatchedTeam(diaries, myTeam);
  return (
    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-1">
      <div className="flex justify-between rounded-lg bg-[#f3f4f6] px-3 py-2">
        <dt className="text-[#6b7280]">직관</dt>
        <dd className="font-bold">{diaries.length}회</dd>
      </div>
      {myTeam && (
        <div className="flex justify-between rounded-lg bg-[#f3f4f6] px-3 py-2">
          <dt className="text-[#6b7280]">직관 승률</dt>
          <dd className="font-bold">
            {total === 0 ? '-' : `${rate}% (${wins}승 ${losses}패)`}
          </dd>
        </div>
      )}
      {mostWatched && (
        <div className="flex justify-between rounded-lg bg-[#f3f4f6] px-3 py-2">
          <dt className="text-[#6b7280]">{myTeam ? '가장 많이 본 상대' : '가장 많이 본 팀'}</dt>
          <dd className="font-bold">{mostWatched.name} {mostWatched.count}회</dd>
        </div>
      )}
    </dl>
  );
}

// 승요 리포트 카드. 리포트가 있으면 리포트, 없거나 실패하면 기본 통계를 보여줌
export default function ReportCard({
  diaries,
  myTeam,
  report,
  loading,
  generating,
  errorMessage,
  onGenerate,
}: ReportCardProps) {
  const enoughDiaries = diaries.length >= MIN_DIARIES_FOR_REPORT;
  const changed = hasDiaryChanges(diaries, report);
  const canGenerate = enoughDiaries && changed && !generating && !loading;
  // 초기화 등으로 일기가 기준보다 적어지면 예전 리포트는 숨김
  const showReport = report !== null && enoughDiaries;

  // 버튼 아래 안내. 생성할 수 없는 이유를 알려줌
  let hint: string | null = null;
  if (!enoughDiaries) {
    hint = `일기를 ${MIN_DIARIES_FOR_REPORT - diaries.length}개 더 쓰면 승요 리포트를 받을 수 있어요.`;
  } else if (report && !changed) {
    hint = '일기를 새로 쓰거나 고치면 리포트를 다시 만들 수 있어요.';
  }

  return (
    <section className="mt-6 w-full rounded-xl border border-[#d1d5db] bg-white p-6 text-[#111111] shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <Sparkles className="size-5 text-[#c8aa6e]" />
          승요 리포트
        </h2>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="flex items-center gap-1.5 rounded-lg bg-[#0a1428] px-3 py-1.5 text-xs font-bold text-[#f0e6d2] transition-colors hover:bg-[#121c2c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw className={`size-3.5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? '만드는 중…' : report ? '새로 만들기' : '리포트 만들기'}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6b7280]">리포트를 불러오는 중…</p>
      ) : showReport ? (
        <div className="flex flex-col gap-3">
          <p className="text-base font-black text-[#0a1428]">{report.content.title}</p>
          <p className="text-sm leading-relaxed">{report.content.summary}</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {report.content.highlights.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#c8aa6e]">◆</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-[#0a1428] px-3 py-2 text-sm font-bold text-[#f0e6d2]">
            {report.content.comment}
          </p>
          <p className="text-[11px] text-[#9ca3af]">
            {new Date(report.createdAt).toLocaleDateString('ko-KR')} · 일기 {report.diaryCount}개 기준 · AI가 쓴 리포트예요
          </p>
        </div>
      ) : (
        <BasicStats diaries={diaries} myTeam={myTeam} />
      )}

      {errorMessage && <p className="mt-3 text-xs font-bold text-[#e11d48]">{errorMessage}</p>}
      {!errorMessage && hint && <p className="mt-3 text-xs text-[#6b7280]">{hint}</p>}
    </section>
  );
}
