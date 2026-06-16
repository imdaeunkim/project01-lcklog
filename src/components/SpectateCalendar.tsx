// src/components/SpectateCalendar.tsx
import { Trophy, Percent, Heart } from "lucide-react"

/* ------------------------------------------------------------------ */
/* Types & Data (달력에 필요한 부품들)                                   */
/* ------------------------------------------------------------------ */
type Team = "T1" | "GEN" | "HLE" | "DK" | "KT" | "BRO" | "NS" | "DRX" | "KDF" | "FOX"
type MatchResult = "win" | "loss" | "scheduled"

interface CalendarMatch {
  day: number
  opponent: Team
  result: MatchResult
  score?: string
}

const teamColors: Record<Team, string> = {
  T1: "oklch(0.55 0.16 250)", GEN: "oklch(0.45 0.05 280)", HLE: "oklch(0.62 0.18 35)",
  DK: "oklch(0.5 0.13 200)", KT: "oklch(0.58 0.22 25)", BRO: "oklch(0.6 0.14 145)",
  NS: "oklch(0.55 0.12 300)", DRX: "oklch(0.5 0.14 230)", KDF: "oklch(0.62 0.16 80)",
  FOX: "oklch(0.55 0.18 20)",
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

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]
const MONTH_LABEL = "2025. 06"
const DAYS_IN_MONTH = 30
const FIRST_WEEKDAY = 0

/* ------------------------------------------------------------------ */
/* Helper Functions                                                   */
/* ------------------------------------------------------------------ */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function getMatch(day: number): CalendarMatch | undefined {
  return calendarMatches.find((m) => m.day === day)
}

/* ------------------------------------------------------------------ */
/* Sub-Components (달력 내부 부품들)                                    */
/* ------------------------------------------------------------------ */
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
      <span className={cn("text-[10px] font-medium sm:text-xs", match ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>
        {day}
      </span>

      {match && (
        <div className="mt-auto flex flex-col gap-0.5">
          {(isWin || isLoss) && (
            <span className={cn("inline-flex w-fit -rotate-3 items-center rounded-sm px-1 py-px font-heading text-[8px] uppercase leading-none tracking-wider text-white shadow-sm sm:text-[9px]", isWin ? "bg-[var(--victory)]" : "bg-[var(--defeat)]")}>
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

/* ------------------------------------------------------------------ */
/* Main Component Export                                               */
/* ------------------------------------------------------------------ */
export default function SpectateCalendar() {
  const cells: (number | null)[] = [
    ...Array(FIRST_WEEKDAY).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ]

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
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

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--victory)]" /> 승리 직관
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-[var(--defeat)]" /> 패배 직관
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-[var(--accent)]/50 bg-[var(--accent)]/15" /> 경기 예정
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={cn("text-center text-[10px] font-medium sm:text-xs", i === 0 ? "text-[var(--defeat)]/70" : "text-[var(--muted-foreground)]")}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((day, i) => (
          <DayCell key={i} day={day} />
        ))}
      </div>

      <div className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Summary</span>
          <span className="text-[11px] text-[var(--muted-foreground)]">내 직관 전적</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl text-[var(--foreground)]">{seasonSummary.total}전</span>
            <span className="font-heading text-base text-[var(--victory)]">{seasonSummary.wins}승</span>
            <span className="font-heading text-base text-[var(--defeat)]">{seasonSummary.losses}패</span>
          </div>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[var(--muted-foreground)]">승률</span>
            <span className="font-heading text-base text-[var(--foreground)]">{seasonSummary.winRate}%</span>
          </div>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[var(--muted-foreground)]">최다 직관</span>
            <span className="font-heading text-base text-[var(--primary)]">{seasonSummary.mostTeam}</span>
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div className="h-full rounded-full bg-[var(--victory)]" style={{ width: `${seasonSummary.winRate}%` }} />
        </div>
      </div>
    </section>
  )
}