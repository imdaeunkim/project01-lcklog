export interface Diary {
  id: number;
  match: string;
  score: string;
  result: 'WIN' | 'LOSE';
  location: string;
  date: string;
  content: string;
  pom: string;
  image?: string;
  images?: string[];
  representativeIndex?: number;
  // 세트 수(BO3/BO5). 이 필드가 생기기 전에 저장된 일기에는 없음
  matchFormat?: 3 | 5;
  pickedChampions?: Record<string, { name: string; imageUrl: string }>;
}