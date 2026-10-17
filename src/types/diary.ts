export interface Diary {
  id: number;
  date: string;
  match : Match;
  location: string;
  pom: string;
  content: string;
  image?: string;
  images?: string[];
  representativeIndex?: number;
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