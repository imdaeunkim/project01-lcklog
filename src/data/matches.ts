import type { Match } from '../types/diary';

// 시연용 샘플 경기 데이터. 실제 경기 일정·결과가 아님
// date는 Diary.date와 같은 "YYYY.MM.DD" 형식
const SAMPLE_MATCHES: Match[] = [
  { id: '2026.10.03-1', date: '2026.10.03', teamA: 'T1', teamB: 'DK', scoreA: 2, scoreB: 1, format: 3 },
  { id: '2026.10.03-2', date: '2026.10.03', teamA: 'GEN', teamB: 'NS', scoreA: 2, scoreB: 0, format: 3 },
  { id: '2026.10.05-1', date: '2026.10.05', teamA: 'HLE', teamB: 'KT', scoreA: 2, scoreB: 0, format: 3 },
  { id: '2026.10.05-2', date: '2026.10.05', teamA: 'BFX', teamB: 'KRX', scoreA: 1, scoreB: 2, format: 3 },
  { id: '2026.10.08-1', date: '2026.10.08', teamA: 'BRO', teamB: 'DNS', scoreA: 2, scoreB: 1, format: 3 },
  { id: '2026.10.08-2', date: '2026.10.08', teamA: 'T1', teamB: 'GEN', scoreA: 1, scoreB: 2, format: 3 },
  { id: '2026.10.10-1', date: '2026.10.10', teamA: 'DK', teamB: 'HLE', scoreA: 0, scoreB: 2, format: 3 },
  { id: '2026.10.10-2', date: '2026.10.10', teamA: 'KT', teamB: 'NS', scoreA: 2, scoreB: 1, format: 3 },
  { id: '2026.10.12-1', date: '2026.10.12', teamA: 'KRX', teamB: 'T1', scoreA: 0, scoreB: 2, format: 3 },
  { id: '2026.10.12-2', date: '2026.10.12', teamA: 'GEN', teamB: 'BFX', scoreA: 2, scoreB: 0, format: 3 },
  { id: '2026.10.15-1', date: '2026.10.15', teamA: 'HLE', teamB: 'BRO', scoreA: 2, scoreB: 1, format: 3 },
  { id: '2026.10.15-2', date: '2026.10.15', teamA: 'DNS', teamB: 'DK', scoreA: 0, scoreB: 2, format: 3 },
  { id: '2026.10.17-1', date: '2026.10.17', teamA: 'T1', teamB: 'HLE', scoreA: 3, scoreB: 2, format: 5 },
  { id: '2026.10.17-2', date: '2026.10.17', teamA: 'GEN', teamB: 'KT', scoreA: 3, scoreB: 1, format: 5 },
  { id: '2026.10.19-1', date: '2026.10.19', teamA: 'NS', teamB: 'KRX', scoreA: 2, scoreB: 1, format: 3 },
  { id: '2026.10.19-2', date: '2026.10.19', teamA: 'BFX', teamB: 'BRO', scoreA: 1, scoreB: 0, format: 1 },
  { id: '2026.10.22-1', date: '2026.10.22', teamA: 'DK', teamB: 'T1', scoreA: 1, scoreB: 2, format: 3 },
  { id: '2026.10.22-2', date: '2026.10.22', teamA: 'HLE', teamB: 'GEN', scoreA: 2, scoreB: 1, format: 3 },
  { id: '2026.10.24-1', date: '2026.10.24', teamA: 'KT', teamB: 'DNS', scoreA: 2, scoreB: 0, format: 3 },
  { id: '2026.10.24-2', date: '2026.10.24', teamA: 'KRX', teamB: 'HLE', scoreA: 0, scoreB: 2, format: 3 },
];

// 날짜("YYYY.MM.DD")에 열린 경기 목록 반환. 순서는 데이터 순서 그대로
// API 연동 시 이 함수 안쪽만 교체. API 호출은 비동기라 지금부터 Promise로 반환
export async function getMatchesByDate(date: string): Promise<Match[]> {
  return SAMPLE_MATCHES.filter((m) => m.date === date);
}
