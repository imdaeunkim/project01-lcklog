import { useState, type FormEvent, type ReactNode } from "react"
import {
  Trophy,
  Percent,
  Heart,
  MapPin,
  Star,
  BookOpen,
  PenLine,
  Plus,
  Send,
  X,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/* Utils                                                               */
/* ------------------------------------------------------------------ */

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

/* ------------------------------------------------------------------ */
/* Types & data                                                        */
/* ------------------------------------------------------------------ */

type Team =
  | "T1"
  | "GEN"
  | "HLE"
  | "DK"
  | "KT"
  | "BRO"
  | "NS"
  | "DRX"
  | "KDF"
  | "FOX"

type MatchResult = "win" | "loss" | "scheduled"

interface CalendarMatch {
  day: number
  opponent: Team
  result: MatchResult
  score?: string
}

interface DiaryEntry {
  id: string
  date: string
  matchup: { home: Team; away: Team }
  result: "win" | "loss"
  seat: string
  photo: string
  oneLiner: string
  memo: string
  pom: string
}

const teamColors: Record<Team, string> = {
  T1: "oklch(0.55 0.16 250)",
  GEN: "oklch(0.45 0.05 280)",
  HLE: "oklch(0.62 0.18 35)",
  DK: "oklch(0.5 0.13 200)",
  KT: "oklch(0.58 0.22 25)",
  BRO: "oklch(0.6 0.14 145)",
  NS: "oklch(0.55 0.12 300)",
  DRX: "oklch(0.5 0.14 230)",
  KDF: "oklch(0.62 0.16 80)",
  FOX: "oklch(0.55 0.18 20)",
}

const teamFullNames: Record<Team, string> = {
  T1: "T1",
  GEN: "Gen.G",
  HLE: "Hanwha Life",
  DK: "Dplus KIA",
  KT: "KT Rolster",
  BRO: "OKSavingsBank BRION",
  NS: "Nongshim RedForce",
  DRX: "DRX",
  KDF: "Kwangdong Freecs",
  FOX: "BNK FEARX",
}

const TEAMS = Object.keys(teamFullNames) as Team[]
const PHOTOS = [
  "/images/stadium-1.png",
  "/images/stadium-2.png",
  "/images/stadium-3.png",
]

const myProfile = {
  icon: "/images/summoner-icon.png",
  name: "직관마스터",
  tag: "LCK",
  tier: "골드 직관러",
  yearCount: 15,
  winRate: 66.7,
  mostTeam: "T1" as Team,
}

const seasonSummary = {
  total: 15,
  wins: 10,
  losses: 5,
  winRate: 66.7,
  mostTeam: "T1" as Team,
}

const calendarMatches: CalendarMatch[] = [
  { day: 3, opponent: "KT", result: "win", score: "2:0" },
  { day: 7, opponent: "GEN", result: "loss", score: "1:2" },
  { day: 11, opponent: "HLE", result: "win", score: "2:1" },
  { day: 14, opponent: "DK", result: "win", score: "2:0" },
  { day: 18, opponent: "BRO", result: "loss", score: "0:2" },
  { day: 21, opponent: "NS", result: "scheduled" },
  { day: 25, opponent: "DRX", result: "scheduled" },
  { day: 28, opponent: "GEN", result: "scheduled" },
]

const initialDiaryEntries: DiaryEntry[] = [
  {
    id: "1",
    date: "2025.06.14",
    matchup: { home: "T1", away: "DK" },
    result: "win",
    seat: "A구역 12열 7번",
    photo: "/images/stadium-2.png",
    oneLiner: "페이커 갈리오 궁 들어가는 순간 소름 돋았다 진짜",
    memo: "2세트 한타에서 역전당할 뻔했는데 미드 갱킹 한 번으로 분위기 완전히 가져왔다. 현장에서 보니까 함성이 진짜 미쳤음. 오늘 직관 온 보람 100%.",
    pom: "Faker",
  },
  {
    id: "2",
    date: "2025.06.11",
    matchup: { home: "T1", away: "HLE" },
    result: "win",
    seat: "B구역 5열 22번",
    photo: "/images/stadium-1.png",
    oneLiner: "풀세트 접전 끝에 승리! 손에 땀 쥐고 봤다",
    memo: "3세트 후반 바론 스틸 장면에서 다 같이 일어났다. 옆자리 분이랑 하이파이브함 ㅋㅋ 직관의 묘미.",
    pom: "Oner",
  },
  {
    id: "3",
    date: "2025.06.07",
    matchup: { home: "T1", away: "GEN" },
    result: "loss",
    seat: "A구역 3열 15번",
    photo: "/images/stadium-3.png",
    oneLiner: "통신사 더비 패배... 그래도 현장 분위기는 최고였다",
    memo: "졌지만 후회는 없다. 라인전부터 치열했고 마지막 한타까지 손에 땀을 쥐게 했음. 다음엔 꼭 이기자.",
    pom: "Chovy",
  },
]

/* ------------------------------------------------------------------ */
/* Theme styles (self-contained, no Tailwind config required)          */
/* ------------------------------------------------------------------ */

const themeStyles = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');

.lck-root {
  --background: oklch(0.985 0.004 240);
  --foreground: oklch(0.21 0.03 250);
  --card: oklch(1 0 0);
  --primary: oklch(0.55 0.16 250);
  --primary-foreground: oklch(0.99 0.005 240);
  --muted: oklch(0.955 0.008 240);
  --muted-foreground: oklch(0.52 0.025 250);
  --accent: oklch(0.8 0.12 85);
  --accent-foreground: oklch(0.28 0.05 80);
  --border: oklch(0.9 0.012 240);
  --victory: oklch(0.55 0.16 250);
  --defeat: oklch(0.58 0.22 25);
  --gold: oklch(0.78 0.13 80);
  --font-heading: 'Oswald', system-ui, sans-serif;

  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--foreground);
  background-color: var(--background);
}
.lck-root .font-heading { font-family: var(--font-heading); }
`

/* ------------------------------------------------------------------ */
/* Small UI building blocks                                            */
/* ------------------------------------------------------------------ */

function InfoStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: ReactNode
  accent?: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-[var(--primary-foreground)]"
        style={{ backgroundColor: accent ?? "var(--primary)" }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </span>
        <span className="font-heading text-lg leading-tight text-[var(--foreground)]">
          {value}
        </span>
      </div>
    </div>
  )
}

function MatchupBadge({
  home,
  away,
  className,
}: {
  home: Team
  away: Team
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1",
        className,
      )}
    >
      <span
        className="font-heading text-sm leading-none"
        style={{ color: teamColors[home] }}
      >
        {home}
      </span>
      <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
        vs
      </span>
      <span
        className="font-heading text-sm leading-none"
        style={{ color: teamColors[away] }}
      >
        {away}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Profile header                                                      */
/* ------------------------------------------------------------------ */

function ProfileHeader() {
  return (
    <header className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)]" />
      <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Profile identity */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="overflow-hidden rounded-lg border-2 border-[var(--primary)]/30 bg-[var(--muted)]">
              <img
                src={myProfile.icon || "/placeholder.svg"}
                alt="내 소환사 아이콘"
                width={72}
                height={72}
                className="size-16 object-cover sm:size-[72px]"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded border border-[var(--accent)]/50 bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-foreground)]">
              LV.15
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-1.5">
              <h1 className="font-heading text-2xl tracking-tight text-[var(--foreground)] sm:text-3xl">
                {myProfile.name}
              </h1>
              <span className="font-mono text-sm text-[var(--muted-foreground)]">
                #{myProfile.tag}
              </span>
            </div>
            <div className="flex w-fit items-center gap-1.5 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-2.5 py-1">
              <Trophy className="size-3.5 text-[var(--gold)]" />
              <span className="text-xs font-semibold text-[var(--accent-foreground)]">
                {myProfile.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Rank-info style stats bar */}
        <div className="grid grid-cols-1 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <InfoStat
            label="올해 직관"
            value={`${myProfile.yearCount}회`}
            icon={<Trophy className="size-4" />}
          />
          <InfoStat
            label="직관 승률"
            value={`${myProfile.winRate}%`}
            icon={<Percent className="size-4" />}
            accent="var(--gold)"
          />
          <InfoStat
            label="모스트 팀"
            value={myProfile.mostTeam}
            icon={<Heart className="size-4" />}
            accent={teamColors[myProfile.mostTeam]}
          />
        </div>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]
const MONTH_LABEL = "2025. 06"
const DAYS_IN_MONTH = 30
const FIRST_WEEKDAY = 0

function getMatch(day: number): CalendarMatch | undefined {
  return calendarMatches.find((m) => m.day === day)
}

function DayCell({ day }: { day: number | null }) {
  if (day === null) {
    return <div className="aspect-square rounded-md" />
  }
  const match = getMatch(day)
  const isWin = match?.result === "win"
  const isLoss = match?.result === "loss"
  const isScheduled = match?.result === "scheduled"

  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col rounded-md border p-1 transition-colors sm:p-1.5",
        match ? "border-[var(--border)] bg-[var(--card)]" : "border-transparent bg-[var(--muted)]/30",
        isWin && "border-[var(--victory)]/30 bg-[var(--victory)]/5",
        isLoss && "border-[var(--defeat)]/30 bg-[var(--defeat)]/5",
      )}
    >
      <span
        className={cn(
          "text-[10px] font-medium sm:text-xs",
          match ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
        )}
      >
        {day}
      </span>

      {match && (
        <div className="mt-auto flex flex-col gap-0.5">
          {(isWin || isLoss) && (
            <span
              className={cn(
                "inline-flex w-fit -rotate-3 items-center rounded-sm px-1 py-px font-heading text-[8px] uppercase leading-none tracking-wider text-white shadow-sm sm:text-[9px]",
                isWin ? "bg-[var(--victory)]" : "bg-[var(--defeat)]",
              )}
            >
              {isWin ? "Victory" : "Defeat"}
            </span>
          )}
          {isScheduled && (
            <span className="inline-flex w-fit items-center rounded-sm border border-[var(--accent)]/50 bg-[var(--accent)]/15 px-1 py-px text-[8px] font-semibold leading-none text-[var(--accent-foreground)] sm:text-[9px]">
              예정
            </span>
          )}
          <span className="truncate text-[8px] leading-tight text-[var(--muted-foreground)] sm:text-[10px]">
            vs {match.opponent}
            {match.score ? ` ${match.score}` : ""}
          </span>
        </div>
      )}
    </div>
  )
}

function SpectateCalendar() {
  const cells: (number | null)[] = [
    ...Array(FIRST_WEEKDAY).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ]

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--primary)]" />
          <h2 className="font-heading text-lg tracking-tight text-[var(--foreground)]">
            직관 전적 캘린더
          </h2>
        </div>
        <span className="font-mono text-sm text-[var(--muted-foreground)]">
          {MONTH_LABEL}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--victory)]" /> 승리 직관
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--defeat)]" /> 패배 직관
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-[var(--accent)]/50 bg-[var(--accent)]/15" />{" "}
          경기 예정
        </span>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-[10px] font-medium sm:text-xs",
              i === 0 ? "text-[var(--defeat)]/70" : "text-[var(--muted-foreground)]",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((day, i) => (
          <DayCell key={i} day={day} />
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Summary
          </span>
          <span className="text-[11px] text-[var(--muted-foreground)]">내 직관 전적</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl text-[var(--foreground)]">
              {seasonSummary.total}전
            </span>
            <span className="font-heading text-base text-[var(--victory)]">
              {seasonSummary.wins}승
            </span>
            <span className="font-heading text-base text-[var(--defeat)]">
              {seasonSummary.losses}패
            </span>
          </div>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[var(--muted-foreground)]">승률</span>
            <span className="font-heading text-base text-[var(--foreground)]">
              {seasonSummary.winRate}%
            </span>
          </div>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[var(--muted-foreground)]">최다 직관</span>
            <span className="font-heading text-base text-[var(--primary)]">
              {seasonSummary.mostTeam}
            </span>
          </div>
        </div>
        {/* win-rate bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--victory)]"
            style={{ width: `${seasonSummary.winRate}%` }}
          />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Diary card                                                          */
/* ------------------------------------------------------------------ */

function DiaryCard({ entry }: { entry: DiaryEntry }) {
  const isWin = entry.result === "win"

  return (
    <article className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-44">
          <img
            src={entry.photo || "/placeholder.svg"}
            alt={`${entry.matchup.home} vs ${entry.matchup.away} 직관 사진`}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={cn(
              "absolute left-2 top-2 -rotate-3 rounded-sm px-1.5 py-0.5 font-heading text-[11px] uppercase tracking-wider text-white shadow-md",
              isWin ? "bg-[var(--victory)]" : "bg-[var(--defeat)]",
            )}
          >
            {isWin ? "Victory" : "Defeat"}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MatchupBadge home={entry.matchup.home} away={entry.matchup.away} />
            <time className="font-mono text-xs text-[var(--muted-foreground)]">
              {entry.date}
            </time>
          </div>

          {/* Seat */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <MapPin className="size-3.5 text-[var(--primary)]" />
            <span>{entry.seat}</span>
          </div>

          {/* One-liner */}
          <p className="text-pretty font-medium leading-snug text-[var(--foreground)]">
            {"\u201C"}
            {entry.oneLiner}
            {"\u201D"}
          </p>

          {/* Memo */}
          <p className="text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
            {entry.memo}
          </p>

          {/* POM */}
          <div className="mt-auto flex w-fit items-center gap-1.5 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-2.5 py-1">
            <Star className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
            <span className="text-xs font-semibold text-[var(--accent-foreground)]">
              오늘의 POM · {entry.pom}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Reusable form primitives (native, no shadcn)                        */
/* ------------------------------------------------------------------ */

const fieldClass =
  "h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-medium text-[var(--muted-foreground)]">
      {children}
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Quick write form                                                    */
/* ------------------------------------------------------------------ */

function QuickWriteForm({
  onSubmit,
}: {
  onSubmit: (entry: DiaryEntry) => void
}) {
  const [open, setOpen] = useState(false)
  const [home, setHome] = useState<Team>("T1")
  const [away, setAway] = useState<Team>("GEN")
  const [result, setResult] = useState<"win" | "loss">("win")
  const [seat, setSeat] = useState("")
  const [oneLiner, setOneLiner] = useState("")
  const [memo, setMemo] = useState("")
  const [pom, setPom] = useState("")

  function reset() {
    setHome("T1")
    setAway("GEN")
    setResult("win")
    setSeat("")
    setOneLiner("")
    setMemo("")
    setPom("")
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!oneLiner.trim()) return
    const now = new Date()
    const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(
      now.getDate(),
    ).padStart(2, "0")}`
    onSubmit({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      date,
      matchup: { home, away },
      result,
      seat: seat.trim() || "좌석 미입력",
      photo: PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
      oneLiner: oneLiner.trim(),
      memo: memo.trim() || "메모 없음",
      pom: pom.trim() || "미선정",
    })
    reset()
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--primary)]/40 bg-[var(--card)] p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
          <PenLine className="size-4" />
        </span>
        <span className="flex flex-col">
          <span className="font-medium text-[var(--foreground)]">오늘의 직관 기록하기</span>
          <span className="text-xs text-[var(--muted-foreground)]">
            경기장에서 느낀 그 순간을 바로 남겨보세요
          </span>
        </span>
        <Plus className="ml-auto size-5 text-[var(--primary)]" />
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--card)] p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--primary)]" />
          <h3 className="font-heading text-lg tracking-tight text-[var(--foreground)]">
            직관 작성하기
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="작성 취소"
          className="flex size-8 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Matchup + result */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>홈 팀</FieldLabel>
          <select
            value={home}
            onChange={(e) => setHome(e.target.value as Team)}
            className={fieldClass}
          >
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>상대 팀</FieldLabel>
          <select
            value={away}
            onChange={(e) => setAway(e.target.value as Team)}
            className={fieldClass}
          >
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>결과</FieldLabel>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setResult("win")}
              className={
                result === "win"
                  ? "rounded-md bg-[var(--victory)] py-1.5 font-heading text-xs uppercase tracking-wider text-white"
                  : "rounded-md border border-[var(--border)] py-1.5 font-heading text-xs uppercase tracking-wider text-[var(--muted-foreground)]"
              }
            >
              Win
            </button>
            <button
              type="button"
              onClick={() => setResult("loss")}
              className={
                result === "loss"
                  ? "rounded-md bg-[var(--defeat)] py-1.5 font-heading text-xs uppercase tracking-wider text-white"
                  : "rounded-md border border-[var(--border)] py-1.5 font-heading text-xs uppercase tracking-wider text-[var(--muted-foreground)]"
              }
            >
              Loss
            </button>
          </div>
        </div>
      </div>

      {/* Seat + POM */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>좌석 구역</FieldLabel>
          <input
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            placeholder="예: A구역 12열 7번"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>오늘의 POM</FieldLabel>
          <input
            value={pom}
            onChange={(e) => setPom(e.target.value)}
            placeholder="예: Faker"
            className={fieldClass}
          />
        </div>
      </div>

      {/* One-liner */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>한 줄 평</FieldLabel>
        <input
          value={oneLiner}
          onChange={(e) => setOneLiner(e.target.value)}
          placeholder="오늘 직관의 한 줄 감상을 남겨주세요"
          required
          className={fieldClass}
        />
      </div>

      {/* Memo */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel>상세 메모</FieldLabel>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="기억하고 싶은 순간을 자세히 기록해보세요"
          rows={3}
          className={cn(fieldClass, "h-auto resize-y py-2 leading-relaxed")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          취소
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
        >
          <Send className="size-4" />
          기록 저장
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Diary feed                                                          */
/* ------------------------------------------------------------------ */

function DiaryFeed() {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialDiaryEntries)

  function handleAdd(entry: DiaryEntry) {
    setEntries((prev) => [entry, ...prev])
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--primary)]" />
          <h2 className="font-heading text-lg tracking-tight text-[var(--foreground)]">
            나의 직관 일기
          </h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <BookOpen className="size-3.5" />
          {entries.length}개의 기록
        </span>
      </div>

      <QuickWriteForm onSubmit={handleAdd} />

      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <DiaryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <div className="lck-root min-h-screen">
      <style>{themeStyles}</style>

      {/* Top app bar */}
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[var(--primary)] font-heading text-sm text-[var(--primary-foreground)]">
              LCK
            </span>
            <span className="font-heading text-lg tracking-tight text-[var(--foreground)]">
              직관 다이어리
            </span>
          </div>
          <span className="hidden text-xs text-[var(--muted-foreground)] sm:block">
            나만을 위한 ��라이빗 직관 기록
          </span>
        </div>
      </div>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <ProfileHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SpectateCalendar />
          </div>
          <div className="lg:col-span-3">
            <DiaryFeed />
          </div>
        </div>
      </main>
    </div>
  )
}