import type { Match } from '../types/diary';
import { toTeamId } from './teams';

// 경기 데이터 출처: Leaguepedia(lol.fandom.com) Cargo API. 키 없이 브라우저에서 바로 호출 가능
// 비로그인 요청은 횟수 제한이 빡빡해서(연속 몇 번이면 막힘) 1년치를 한 번에 받아 저장해 두고 씀
const API_URL = 'https://lol.fandom.com/api.php';
// 이 연도보다 이전 경기는 불러오지 않음 (2026 시즌부터, 사용자 결정)
const FIRST_YEAR = 2026;
// 한 번에 받을 최대 줄 수. 2026년 LCK는 약 190경기
const LIMIT = 500;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 경기 불러오기 실패. rateLimited면 요청 횟수 제한에 걸린 것 (잠시 후 다시 시도하면 됨)
export class MatchLoadError extends Error {
  rateLimited: boolean;
  constructor(message: string, rateLimited: boolean) {
    super(message);
    this.rateLimited = rateLimited;
  }
}

// API 응답의 경기 한 줄. 값은 모두 문자열(비어 있을 수 있음)
interface ScheduleRow {
  MatchId: string;
  Team1: string;
  Team2: string;
  Team1Score: string;
  Team2Score: string;
  BestOf: string;
  'DateTime UTC': string; // 응답에서는 밑줄 대신 띄어쓰기
}

// 연도별 경기 목록 저장. 같은 연도 안에서는 날짜를 바꿔도 API를 다시 부르지 않음
const cache = new Map<number, Promise<Match[]>>();

// 한국 시간 "YYYY-MM-DD HH:MM:SS" → UTC 기준 API 시간 형식으로 변환
function kstToUtc(kst: string): string {
  const time = Date.parse(`${kst.replace(' ', 'T')}Z`) - KST_OFFSET_MS;
  return new Date(time).toISOString().slice(0, 19).replace('T', ' ');
}

// API의 UTC 시간 "YYYY-MM-DD HH:MM:SS" → 한국 날짜 "YYYY.MM.DD"
function utcToKstDate(utc: string): string {
  const time = Date.parse(`${utc.replace(' ', 'T')}Z`) + KST_OFFSET_MS;
  return new Date(time).toISOString().slice(0, 10).replace(/-/g, '.');
}

// API 한 줄을 Match로 변환. BO 형식이 1·3·5가 아니거나 시간이 없으면 null
function toMatch(row: ScheduleRow): Match | null {
  const format = Number(row.BestOf);
  if (format !== 1 && format !== 3 && format !== 5) return null;
  if (!row['DateTime UTC']) return null;
  return {
    id: row.MatchId,
    date: utcToKstDate(row['DateTime UTC']),
    teamA: toTeamId(row.Team1),
    teamB: toTeamId(row.Team2),
    scoreA: Number(row.Team1Score) || 0, // 아직 안 열린 경기는 빈 값 → 0
    scoreB: Number(row.Team2Score) || 0,
    format,
  };
}

// 한국 시간 기준 1년치 LCK 경기를 한 번에 불러옴
async function fetchYearMatches(year: number): Promise<Match[]> {
  const from = kstToUtc(`${year}-01-01 00:00:00`);
  const to = kstToUtc(`${year + 1}-01-01 00:00:00`);
  const params = new URLSearchParams({
    action: 'cargoquery',
    format: 'json',
    origin: '*', // 다른 사이트(브라우저)에서 부를 때 필요
    tables: 'MatchSchedule',
    fields: 'MatchId,Team1,Team2,Team1Score,Team2Score,BestOf,DateTime_UTC',
    // LCK 정규 대회만. 쇼매치 페이지는 제외
    where: `DateTime_UTC >= "${from}" AND DateTime_UTC < "${to}" AND OverviewPage LIKE "LCK/%" AND OverviewPage NOT LIKE "%Showmatch%"`,
    order_by: 'DateTime_UTC',
    limit: String(LIMIT),
  });
  const res = await fetch(`${API_URL}?${params}`);
  if (!res.ok) throw new MatchLoadError(`경기 API 응답 오류: ${res.status}`, res.status === 429);
  const data = await res.json();
  // 요청 형식이 틀리거나 횟수 제한에 걸리면 200 응답 안에 error가 담겨 옴
  if (data.error) {
    throw new MatchLoadError(`경기 API 오류: ${data.error.info ?? data.error.code}`, data.error.code === 'ratelimited');
  }
  const rows: { title: ScheduleRow }[] = data.cargoquery ?? [];
  if (rows.length >= LIMIT) console.warn(`${year}년 경기가 ${LIMIT}개 이상이라 일부가 빠졌을 수 있음`);
  return rows.map((r) => toMatch(r.title)).filter((m): m is Match => m !== null);
}

// 날짜("YYYY.MM.DD", 한국 날짜)에 열린 LCK 경기 목록 반환. 순서는 경기 시작 시간순
// 실패하면 MatchLoadError를 던짐. 실패한 결과는 저장하지 않아서 다시 부르면 재시도
export async function getMatchesByDate(date: string): Promise<Match[]> {
  const year = Number(date.slice(0, 4));
  if (!(year >= FIRST_YEAR)) return []; // 2026년 이전이거나 날짜가 비어 있음
  let request = cache.get(year);
  if (!request) {
    request = fetchYearMatches(year);
    cache.set(year, request);
    request.catch(() => cache.delete(year));
  }
  const matches = await request;
  return matches.filter((m) => m.date === date);
}
