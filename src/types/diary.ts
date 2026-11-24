export interface Diary {
  id: number;
  date: string;
  match : Match;
  location: string | null; // 비어 있으면 null
  pom: string | null; // 비어 있으면 null
  content: string;
  imagePaths: string[]; // Storage 안의 파일 경로 (DB에 저장되는 값)
  images: string[]; // 화면에 보여줄 주소. imagePaths와 같은 순서, 1시간 뒤 만료
  representativeIndex: number;
  pickedChampions?: Record<string, { name: string; imageUrl: string }>;
}
export interface Match {
  id: string;
  date: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  format : 1 | 3 | 5;
}
