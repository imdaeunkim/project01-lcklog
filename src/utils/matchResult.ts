import type { Diary, Match } from '../types/diary';

// 경기가 끝났는지 확인. 이기는 데 필요한 세트 수(BO1=1, BO3=2, BO5=3)에 한 팀이라도 닿았으면 끝남
function isMatchFinished(match: Match): boolean {
  const winsNeeded = Math.ceil(match.format / 2);
  return match.scoreA >= winsNeeded || match.scoreB >= winsNeeded;
}

// 내 팀 기준 승패. 팀 없음, 내 팀이 출전하지 않은 경기, 아직 안 끝난 경기(0:0, 진행 중 1:0 등)면 null
export function getMyResult(match: Match, myTeam: string | null): 'WIN' | 'LOSE' | null {
  if (!myTeam || !isMatchFinished(match)) return null;
  if (match.teamA === myTeam) {
    return match.scoreA > match.scoreB ? 'WIN' : 'LOSE';
  }
  if (match.teamB === myTeam) {
    return match.scoreB > match.scoreA ? 'WIN' : 'LOSE';
  }
  return null;
}

// 내 팀 경기만으로 전적·승률 계산. 팀 없음이면 0전
export function getWinStats(diaries: Diary[], myTeam: string | null) {
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