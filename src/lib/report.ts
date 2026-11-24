import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Diary } from '../types/diary';

// 리포트를 만들 수 있는 최소 일기 수 (Edge Function의 MIN_DIARIES와 같은 값)
export const MIN_DIARIES_FOR_REPORT = 3;
// 이 시간 안에 응답이 없으면 실패로 보고 기본 통계 카드를 보여줌
const REPORT_TIMEOUT_MS = 30_000;

// Claude가 써 준 리포트 내용 (Edge Function의 ReportSchema와 같은 모양)
export interface ReportContent {
  title: string;
  summary: string;
  highlights: string[];
  comment: string;
}

// DB reports 행 (사용자당 1개, 가장 최근 리포트)
export interface Report {
  content: ReportContent;
  diaryCount: number; // 리포트를 만들 때의 일기 수
  diariesUpdatedAt: string; // 리포트를 만들 때 가장 최근 일기 수정 시각
  createdAt: string;
}

interface ReportRow {
  content: ReportContent;
  diary_count: number;
  diaries_updated_at: string;
  created_at: string;
}

function toReport(row: ReportRow): Report {
  return {
    content: row.content,
    diaryCount: row.diary_count,
    diariesUpdatedAt: row.diaries_updated_at,
    createdAt: row.created_at,
  };
}

// 저장된 내 리포트. 없으면 null
export async function fetchReport(userId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('content, diary_count, diaries_updated_at, created_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toReport(data as ReportRow) : null;
}

// 지난 리포트 뒤로 일기가 바뀌었는지. 개수(추가·삭제)와 가장 최근 수정 시각(수정)으로 판단.
// 화면 안내용이고 실제로 막는 것은 Edge Function
export function hasDiaryChanges(diaries: Diary[], report: Report | null): boolean {
  if (!report) return true;
  if (diaries.length !== report.diaryCount) return true;
  const latest = Math.max(...diaries.map((d) => Date.parse(d.updatedAt)));
  return latest !== Date.parse(report.diariesUpdatedAt);
}

// 실패 원인별 안내 문구. 원인 코드는 Edge Function이 돌려주는 error 값
const ERROR_MESSAGES: Record<string, string> = {
  not_enough_diaries: `일기가 ${MIN_DIARIES_FOR_REPORT}개 이상 있어야 리포트를 만들 수 있어요.`,
  no_changes: '지난 리포트 이후 바뀐 일기가 없어요. 일기를 쓰거나 고치면 다시 만들 수 있어요.',
  timeout: '리포트가 늦어지고 있어요. 잠시 뒤 새로고침하면 완성된 리포트가 보일 수 있어요.',
};
const DEFAULT_ERROR_MESSAGE = '리포트를 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.';

// 화면에 보여줄 안내 문구를 담은 에러
export class ReportError extends Error {}

// Edge Function을 불러 새 리포트를 만듦. 로그인 토큰은 supabase 클라이언트가 자동으로 붙임
export async function generateReport(): Promise<Report> {
  const timeout = AbortSignal.timeout(REPORT_TIMEOUT_MS);
  const { data, error } = await supabase.functions.invoke('lol-report', { method: 'POST', signal: timeout });

  if (error) {
    console.error('리포트 생성 실패:', error);
    if (timeout.aborted) throw new ReportError(ERROR_MESSAGES.timeout);
    // 함수가 에러 응답(4xx·5xx)을 보냈으면 본문의 error 코드로 안내 문구를 고름
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      const code = typeof body?.error === 'string' ? body.error : '';
      throw new ReportError(ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGE);
    }
    throw new ReportError(DEFAULT_ERROR_MESSAGE);
  }
  return toReport((data as { report: ReportRow }).report);
}
