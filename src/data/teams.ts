// LCK 팀 목록. 
export interface Team {
  id: string;
  name: string;
}

export const TEAMS: Team[] = [
  { id: 'GEN', name: 'Gen.G' },
  { id: 'HLE', name: 'Hanwha Life Esports' },
  { id: 'T1', name: 'T1' },
  { id: 'KT', name: 'kt Rolster' },
  { id: 'DK', name: 'Dplus Kia' },
  { id: 'BFX', name: 'BNK FEARX' },
  { id: 'NS', name: 'Nongshim RedForce' },
  { id: 'KRX', name: 'KIWOOM DRX' },
  { id: 'BRO', name: 'HANJIN BRION' },
  { id: 'DNS', name: 'DN sOOPers' },
];

// id로 팀 이름 찾기. 목록에 없으면 id 그대로 반환
export function getTeamName(id: string): string {
  return TEAMS.find((t) => t.id === id)?.name ?? id;
}
