// 사용자 프로필. DB profiles 테이블의 한 행
export interface Profile {
  nickname: string;
  tag: string;
  myTeam: string | null; // null이면 "팀 없음" → 승률·티어 숨김
  nicknameChangedAt: string | null; // null이면 아직 무작위 닉네임 → 첫 변경은 90일 제한 없음
}
