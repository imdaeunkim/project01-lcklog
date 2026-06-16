// src/components/DiaryFeed.tsx
import { useState, type FormEvent } from "react"
import { MapPin, Star, PenLine, Plus, X, Send, BookOpen } from "lucide-react"

/* ------------------------------------------------------------------ */
/* Types & Data (일기장에 필요한 타입과 더미 데이터)                       */
/* ------------------------------------------------------------------ */
type Team = "T1" | "GEN" | "HLE" | "DK" | "KT" | "BRO" | "NS" | "DRX" | "KDF" | "FOX"

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
  T1: "oklch(0.55 0.16 250)", GEN: "oklch(0.45 0.05 280)", HLE: "oklch(0.62 0.18 35)",
  DK: "oklch(0.5 0.13 200)", KT: "oklch(0.58 0.22 25)", BRO: "oklch(0.6 0.14 145)",
  NS: "oklch(0.55 0.12 300)", DRX: "oklch(0.5 0.14 230)", KDF: "oklch(0.62 0.16 80)",
  FOX: "oklch(0.55 0.18 20)",
}

const teamFullNames: Record<Team, string> = {
  T1: "T1", GEN: "Gen.G", HLE: "Hanwha Life", DK: "Dplus KIA", KT: "KT Rolster",
  BRO: "OKSavingsBank BRION", NS: "Nongshim RedForce", DRX: "DRX", KDF: "Kwangdong Freecs", FOX: "BNK FEARX",
}

const TEAMS = Object.keys(teamFullNames) as Team[]
const PHOTOS = ["/images/stadium-1.png", "/images/stadium-2.png", "/images/stadium-3.png"]

// 다은 님이 발견하신 바로 그 일기 더미 데이터들!
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
/* Helper 부품들                                                       */
/* ------------------------------------------------------------------ */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const fieldClass =
  "h-9 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"

function MatchupBadge({ home, away, className }: { home: Team; away: Team; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1", className)}>
      <span className="font-heading text-sm leading-none" style={{ color: teamColors[home] }}>{home}</span>
      <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">vs</span>
      <span className="font-heading text-sm leading-none" style={{ color: teamColors[away] }}>{away}</span>
    </div>
  )
}

function DiaryCard({ entry }: { entry: DiaryEntry }) {
  const isWin = entry.result === "win"
  return (
    <article className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-44">
          <img src={entry.photo || "/placeholder.svg"} alt="직관 사진" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className={cn("absolute left-2 top-2 -rotate-3 rounded-sm px-1.5 py-0.5 font-heading text-[11px] uppercase tracking-wider text-white shadow-md", isWin ? "bg-[var(--victory)]" : "bg-[var(--defeat)]")}>
            {isWin ? "Victory" : "Defeat"}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MatchupBadge home={entry.matchup.home} away={entry.matchup.away} />
            <time className="font-mono text-xs text-[var(--muted-foreground)]">{entry.date}</time>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <MapPin className="size-3.5 text-[var(--primary)]" />
            <span>{entry.seat}</span>
          </div>
          <p className="text-pretty font-medium leading-snug text-[var(--foreground)]">“{entry.oneLiner}”</p>
          <p className="text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">{entry.memo}</p>
          <div className="mt-auto flex w-fit items-center gap-1.5 rounded-md border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-2.5 py-1">
            <Star className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
            <span className="text-xs font-semibold text-[var(--accent-foreground)]">오늘의 POM · {entry.pom}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function QuickWriteForm({ onSubmit }: { onSubmit: (entry: DiaryEntry) => void }) {
  const [open, setOpen] = useState(false)
  const [home, setHome] = useState<Team>("T1")
  const [away, setAway] = useState<Team>("GEN")
  const [result, setResult] = useState<"win" | "loss">("win")
  const [seat, setSeat] = useState("")
  const [oneLiner, setOneLiner] = useState("")
  const [memo, setMemo] = useState("")
  const [pom, setPom] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!oneLiner.trim()) return
    const now = new Date()
    const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`
    onSubmit({
      id: String(Date.now()),
      date,
      matchup: { home, away },
      result,
      seat: seat.trim() || "좌석 미입력",
      photo: PHOTOS[Math.floor(Math.random() * PHOTOS.length)],
      oneLiner: oneLiner.trim(),
      memo: memo.trim() || "메모 없음",
      pom: pom.trim() || "미선정",
    })
    setHome("T1"); setAway("GEN"); setResult("win"); setSeat(""); setOneLiner(""); setMemo(""); setPom("");
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--primary)]/40 bg-[var(--card)] p-4 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"><PenLine className="size-4" /></span>
        <span className="flex flex-col">
          <span className="font-medium text-[var(--foreground)]">오늘의 직관 기록하기</span>
          <span className="text-xs text-[var(--muted-foreground)]">경기장에서 느낀 그 순간을 바로 남겨보세요</span>
        </span>
        <Plus className="ml-auto size-5 text-[var(--primary)]" />
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--card)] p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg tracking-tight text-[var(--foreground)]">직관 작성하기</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-[var(--muted-foreground)]"><X className="size-4" /></button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1"><label className="text-xs text-[var(--muted-foreground)]">홈 팀</label>
          <select value={home} onChange={(e) => setHome(e.target.value as Team)} className={fieldClass}>{TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        <div className="flex flex-col gap-1"><label className="text-xs text-[var(--muted-foreground)]">상대 팀</label>
          <select value={away} onChange={(e) => setAway(e.target.value as Team)} className={fieldClass}>{TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        <div className="flex flex-col gap-1"><label className="text-xs text-[var(--muted-foreground)]">결과</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setResult("win")} className={result === "win" ? "rounded-md bg-[var(--victory)] py-1.5 text-xs text-white" : "rounded-md border py-1.5 text-xs"}>Win</button>
            <button type="button" onClick={() => setResult("loss")} className={result === "loss" ? "rounded-md bg-[var(--defeat)] py-1.5 text-xs text-white" : "rounded-md border py-1.5 text-xs"}>Loss</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={seat} onChange={(e) => setSeat(e.target.value)} placeholder="좌석 구역 (예: A구역 12열)" className={fieldClass} />
        <input value={pom} onChange={(e) => setPom(e.target.value)} placeholder="오늘의 POM (예: Faker)" className={fieldClass} />
      </div>
      <input value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} placeholder="오늘 직관의 한 줄 감상" required className={fieldClass} />
      <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="기억하고 싶은 순간의 상세 메모" rows={3} className={cn(fieldClass, "h-auto py-2")} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4 py-2">취소</button>
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white"><Send className="size-4" />기록 저장</button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Main Component Export                                               */
/* ------------------------------------------------------------------ */
export default function DiaryFeed() {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialDiaryEntries)
  function handleAdd(entry: DiaryEntry) { setEntries((prev) => [entry, ...prev]) }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--primary)]" />
          <h2 className="font-heading text-lg tracking-tight text-[var(--foreground)]">나의 직관 일기</h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"><BookOpen className="size-3.5" />{entries.length}개의 기록</span>
      </div>
      <QuickWriteForm onSubmit={handleAdd} />
      <div className="flex flex-col gap-4">
        {entries.map((entry) => <DiaryCard key={entry.id} entry={entry} />)}
      </div>
    </section>
  )
}