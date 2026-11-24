import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { TEAMS } from '../data/teams';
import type { Profile } from '../types/profile';
import { NICKNAME_LOCK_DAYS, ProfileUpdateError, getNicknameUnlockDate, updateProfile, type ProfileChanges } from '../lib/profile';

interface ProfileEditModalProps {
  userId: string;
  profile: Profile;
  onClose: () => void;
  onSaved: (profile: Profile) => void;
}

// 닉네임 최대 글자 수 (DB check 제약 profiles_nickname_check와 같은 값)
const NICKNAME_MAX_LENGTH = 12;

// DB check 제약과 같은 규칙. 닉네임 길이는 DB char_length처럼 글자 수(코드 포인트)로 셈
function validateNickname(nickname: string): string | null {
  const length = [...nickname].length;
  if (length < 3 || length > NICKNAME_MAX_LENGTH) return `닉네임은 3~${NICKNAME_MAX_LENGTH}자로 써 주세요.`;
  if (nickname.includes('#')) return '닉네임에는 #을 쓸 수 없어요.';
  return null;
}

function validateTag(tag: string): string | null {
  if (!/^[A-Za-z0-9]{3,5}$/.test(tag)) return '태그는 영문·숫자 3~5자로 써 주세요.';
  return null;
}

// "YYYY.MM.DD" 형식 (일기 날짜와 같은 점 구분)
function formatDotDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${mm}.${dd}`;
}

// 프로필 수정 모달. 닉네임#태그(90일 제한)와 내 팀(제한 없음) 변경
export default function ProfileEditModal({ userId, profile, onClose, onSaved }: ProfileEditModalProps) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [tag, setTag] = useState(profile.tag);
  const [myTeam, setMyTeam] = useState<string | null>(profile.myTeam);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 제한 기간 중이면 닉네임·태그 칸 잠금
  const unlockDate = getNicknameUnlockDate(profile);
  const isNicknameLocked = unlockDate !== null;
  const isFirstChange = profile.nicknameChangedAt === null;

  const trimmedNickname = nickname.trim();
  const nicknameChanged = trimmedNickname !== profile.nickname || tag !== profile.tag;
  const teamChanged = myTeam !== profile.myTeam;
  // 바꾼 칸만 검사 (기존 값은 DB가 이미 허용한 값)
  const inputError = nicknameChanged ? (validateNickname(trimmedNickname) ?? validateTag(tag)) : null;
  const canSave = (nicknameChanged || teamChanged) && !inputError && !isSaving;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    const changes: ProfileChanges = {};
    if (nicknameChanged) {
      changes.nickname = trimmedNickname;
      changes.tag = tag;
    }
    if (teamChanged) changes.myTeam = myTeam;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const saved = await updateProfile(userId, changes);
      onSaved(saved);
    } catch (err) {
      setErrorMessage(err instanceof ProfileUpdateError ? err.message : '프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
      setIsSaving(false);
    }
  };

  // 너비는 칸마다 따로 지정 (공통 클래스에 w-full을 두면 태그 칸의 w-24보다 우선해서 닉네임 칸이 눌림)
  const inputClass =
    'rounded-lg border border-[#1e2837] bg-[#121c2c] px-3 py-2.5 text-sm font-bold text-white outline-none transition-colors focus:border-[#c8aa6e] disabled:cursor-not-allowed disabled:opacity-40';
  const teamButtonClass = (selected: boolean) =>
    `rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition-colors ${
      selected ? 'border-[#c8aa6e] bg-[#c8aa6e] text-[#0a1428]' : 'border-[#1e2837] bg-[#121c2c] hover:border-[#c8aa6e]'
    }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[#c8aa6e] bg-[#0a1428] p-6 text-[#f0e6d2] shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">프로필 수정</h2>
          <button type="button" onClick={onClose} className="p-1 text-[#9e9eb1] transition-colors hover:text-white" aria-label="닫기">
            <X className="size-6" />
          </button>
        </div>

        {/* 닉네임#태그 */}
        <section className="mt-5">
          <h3 className="text-sm font-black text-white">닉네임#태그</h3>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isNicknameLocked || isSaving}
              className={`${inputClass} min-w-0 flex-1`}
              placeholder="닉네임"
              aria-label="닉네임"
            />
            <span className="font-black text-[#616c7f]">#</span>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              disabled={isNicknameLocked || isSaving}
              maxLength={5}
              className={`${inputClass} w-24 shrink-0`}
              placeholder="태그"
              aria-label="태그"
            />
          </div>
          {isNicknameLocked ? (
            <p className="mt-2 text-xs font-bold text-[#c8aa6e]">
              {formatDotDate(unlockDate)}부터 다시 바꿀 수 있어요.
            </p>
          ) : (
            <p className="mt-2 text-xs text-[#9e9eb1]">
              {isFirstChange ? '처음 한 번은 자유롭게 바꿀 수 있어요. ' : ''}
              바꾸면 {NICKNAME_LOCK_DAYS}일 동안 다시 바꿀 수 없어요(대소문자만 바꿔도 포함).
            </p>
          )}
          {inputError && <p className="mt-1 text-xs font-bold text-[#e84057]">{inputError}</p>}
        </section>

        {/* 내 팀 */}
        <section className="mt-6">
          <h3 className="text-sm font-black text-white">응원하는 팀</h3>
          <p className="mt-1 text-xs text-[#9e9eb1]">직관 승률은 이 팀의 경기 결과로 계산돼요. 언제든 바꿀 수 있어요.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {TEAMS.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setMyTeam(team.id)}
                disabled={isSaving}
                className={teamButtonClass(myTeam === team.id)}
              >
                <span className="block text-[11px] opacity-70">{team.id}</span>
                {team.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMyTeam(null)}
              disabled={isSaving}
              className={`${teamButtonClass(myTeam === null)} col-span-2`}
            >
              <span className="block text-[11px] opacity-70">승률·티어 숨김</span>
              팀 없음
            </button>
          </div>
        </section>

        {errorMessage && (
          <p className="mt-5 rounded-lg border border-[#e84057] bg-[#e84057]/10 px-3 py-2 text-xs font-bold text-[#e84057]">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSave}
          className="mt-5 w-full rounded-lg bg-[#c8aa6e] py-3 text-sm font-black text-[#0a1428] transition-opacity disabled:opacity-30"
        >
          {isSaving ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}
