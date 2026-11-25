// LCK 팀 목록. 
export interface Team {
  id: string;
  name: string;
  short: string;
}

export const TEAMS: Team[] = [
  { id: 'Gen.G', name: 'Gen.G', short : 'GEN'},
  { id: 'Hanwha Life Esports', name: 'Hanwha Life Esports', short : 'HLE'},
  { id: 'T1', name: 'T1', short : 'T1' },
  { id: 'KT Rolster', name: 'KT Rolster', short : 'KT' },
  { id: 'Dplus Kia', name: 'Dplus Kia', short : 'DK' },
  { id: 'BNK FEARX', name: 'BNK FEARX', short : 'BFX' },
  { id: 'Nongshim RedForce', name: 'Nongshim RedForce', short : 'NS' },
  { id: 'Kiwoom DRX', name: 'Kiwoom DRX', short : 'KRX' },
  { id: 'HANJIN BRION', name: 'HANJIN BRION', short : 'BRO' },
  { id: 'DN SOOPers', name: 'DN SOOPers', short : 'DNS' },
];

// 시즌 중 이름이 바뀐 팀. API 예전 이름 → 지금 id
const TEAM_ALIASES: Record<string, string> = {
  'DRX': 'Kiwoom DRX',
  'BRION': 'HANJIN BRION',
};

// API 팀 이름을 우리 팀 id로 변환. 표에 없으면 이름 그대로 반환
export function toTeamId(apiName: string): string {
  return TEAM_ALIASES[apiName] ?? apiName;
}

// id로 팀 이름 찾기. 목록에 없으면 id 그대로 반환
export function getTeamName(id: string): string {
  return TEAMS.find((t) => t.id === id)?.name ?? id;
}

// id로 짧은 이름(예: 'HLE') 찾기. 좁은 칸에 표시할 때 사용. 목록에 없으면 id 그대로 반환
export function getTeamShort(id: string): string {
  return TEAMS.find((t) => t.id === id)?.short ?? id;
}
