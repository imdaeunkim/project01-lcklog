import type { Diary, Match } from '../types/diary';

// 내 팀 기준 승패. 내 팀이 출전하지 않은 경기면 null
export function getMyResult(match: Match, myTeam: string): 'WIN' | 'LOSE' | null {
  if (match.teamA === myTeam) {
    return match.scoreA > match.scoreB ? 'WIN' : 'LOSE';
  }
  if (match.teamB === myTeam) {
    return match.scoreB > match.scoreA ? 'WIN' : 'LOSE';
  }
  return null;
}

// 내 팀 경기만으로 전적·승률 계산
export function getWinStats(diaries: Diary[], myTeam: string) {
  let wins = 0 ; let losses = 0;
  for (const diary of diaries) {
    const result = getMyResult(diary.match, myTeam);
    if(result === 'WIN') wins++;
    else if(result === 'LOSE') losses++;
  }
  const total = wins + losses;
  const rate = total  === 0 ? 0 : Math.floor((wins / total) * 100);
  return { total, wins, losses, rate };
}