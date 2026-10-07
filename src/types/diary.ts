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
  pickedChampions?: Record<string, { name: string; imageUrl: string }>;
}