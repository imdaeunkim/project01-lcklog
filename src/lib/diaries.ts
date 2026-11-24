import { supabase } from './supabase';
import type { Diary, Match } from '../types/diary';

// DB diaries 행에서 읽어오는 컬럼 (DB는 snake_case)
const COLUMNS = 'id, date, match, content, location, pom, picked_champions, image_paths, representative_index';
interface DiaryRow {
  id: number;
  date: string; // "YYYY-MM-DD"
  match: Match;
  content: string;
  location: string | null;
  pom: string | null;
  picked_champions: NonNullable<Diary['pickedChampions']>;
  image_paths: string[];
  representative_index: number;
}

// 사진 버킷 (비공개). 설정과 정책은 docs/db-design.md 11번
export const BUCKET = 'diary-images';
const SIGNED_URL_SECONDS = 60 * 60; // 화면용 주소 유효 시간 1시간
// 버킷 설정과 같은 제한. 화면 검사용 (실제로 막는 것은 버킷)
export const IMAGE_MAX_BYTES = 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 작성·수정 때 넘기는 사진 하나. 이미 올린 사진은 경로, 새로 고른 사진은 파일
export type DiaryImageInput =
  | { kind: 'saved'; path: string }
  | { kind: 'new'; file: File };

// 작성·수정 때 앱이 보내는 값. id는 DB가 매기므로 없음
export interface DiaryInput {
  date: string; // "YYYY.MM.DD"
  match: Match;
  content: string;
  location: string | null;
  pom: string | null;
  pickedChampions: NonNullable<Diary['pickedChampions']>;
  images: DiaryImageInput[];
  representativeIndex: number;
}

// 경로 → 화면용 주소. 실패한 경로는 빠짐 (사진만 안 보이고 일기는 보이게)
async function signUrls(paths: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  if (paths.length === 0) return urls;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error) {
    console.error('사진 주소 받기 실패:', error);
    return urls;
  }
  for (const item of data) {
    if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
  }
  return urls;
}

// DB 행 → 앱 Diary. 날짜는 "YYYY-MM-DD" → "YYYY.MM.DD"
function toDiary(row: DiaryRow, urls: Map<string, string>): Diary {
  return {
    id: row.id,
    date: row.date.replace(/-/g, '.'),
    match: row.match,
    content: row.content,
    location: row.location,
    pom: row.pom,
    pickedChampions: row.picked_champions,
    imagePaths: row.image_paths,
    images: row.image_paths.map((path) => urls.get(path) ?? ''),
    representativeIndex: row.representative_index,
  };
}

// 행 하나를 화면용 Diary로 (사진 주소 포함)
async function toDiaryWithUrls(row: DiaryRow): Promise<Diary> {
  return toDiary(row, await signUrls(row.image_paths));
}

// 앱 입력 → DB 행. 비어 있는 선택 항목은 null 또는 빈 값
function toRow(input: DiaryInput, imagePaths: string[]): Omit<DiaryRow, 'id'> {
  return {
    date: input.date.replace(/\./g, '-'),
    match: input.match,
    content: input.content,
    location: input.location || null,
    pom: input.pom || null,
    picked_champions: input.pickedChampions,
    image_paths: imagePaths,
    representative_index: input.representativeIndex,
  };
}

// Storage 파일 삭제. 실패해도 일기 저장·삭제는 이미 끝났으므로 기록만 남김
async function removeImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.error('사진 파일 삭제 실패:', paths, error);
}

// 새 사진을 내 폴더에 올리고, 입력 순서 그대로 경로 목록을 돌려줌.
// 하나라도 실패하면 이번에 올린 파일을 지우고 에러 발생
async function uploadImages(userId: string, images: DiaryImageInput[]): Promise<{ paths: string[]; uploaded: string[] }> {
  const uploaded: string[] = [];
  const results = await Promise.allSettled(
    images.map(async (image) => {
      if (image.kind === 'saved') return image.path;
      const ext = image.file.type.split('/')[1] || 'jpg';
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, image.file, { contentType: image.file.type });
      if (error) throw error;
      uploaded.push(path);
      return path;
    })
  );

  const failed = results.find((r) => r.status === 'rejected');
  if (failed) {
    await removeImages(uploaded);
    throw failed.reason;
  }
  return { paths: results.map((r) => (r as PromiseFulfilledResult<string>).value), uploaded };
}

// 내 일기 전체. 최근에 작성한 일기가 앞. 사진 주소는 한 번에 받음
export async function fetchDiaries(userId: string): Promise<Diary[]> {
  const { data, error } = await supabase
    .from('diaries')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<DiaryRow[]>();
  if (error) throw error;
  const urls = await signUrls(data.flatMap((row) => row.image_paths));
  return data.map((row) => toDiary(row, urls));
}

// 새 일기 저장. 사진 업로드 → 행 저장 순서. 행 저장이 실패하면 올린 사진을 지움.
// user_id는 DB 기본값(auth.uid())이 채움
export async function createDiary(userId: string, input: DiaryInput): Promise<Diary> {
  const { paths, uploaded } = await uploadImages(userId, input.images);
  const { data, error } = await supabase
    .from('diaries')
    .insert(toRow(input, paths))
    .select(COLUMNS)
    .single<DiaryRow>();
  if (error) {
    await removeImages(uploaded);
    throw error;
  }
  return toDiaryWithUrls(data);
}

// 일기 수정. 행 저장에 성공하면 이번에 뺀 예전 사진 파일을 지움
export async function updateDiary(userId: string, previous: Diary, input: DiaryInput): Promise<Diary> {
  const { paths, uploaded } = await uploadImages(userId, input.images);
  const { data, error } = await supabase
    .from('diaries')
    .update(toRow(input, paths))
    .eq('id', previous.id)
    .select(COLUMNS)
    .single<DiaryRow>();
  if (error) {
    await removeImages(uploaded);
    throw error;
  }
  await removeImages(previous.imagePaths.filter((path) => !paths.includes(path)));
  return toDiaryWithUrls(data);
}

// 일기 삭제. 행을 먼저 지우고 사진 파일을 지움
export async function deleteDiary(diary: Diary): Promise<void> {
  const { error } = await supabase.from('diaries').delete().eq('id', diary.id);
  if (error) throw error;
  await removeImages(diary.imagePaths);
}
