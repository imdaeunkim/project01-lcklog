// src/components/ProfileHeader.tsx
import { Trophy, Percent, Heart } from "lucide-react"

// 이사에 필요한 데이터와 타입을 여기에 임시로 같이 둡니다.
type Team = "T1" | "GEN" | "HLE" | "DK" | "KT" | "BRO" | "NS" | "DRX" | "KDF" | "FOX"

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

const myProfile = {
  icon: "/images/summoner-icon.png",
  name: "직관마스터",
  tag: "LCK",
  tier: "골드 직관러",
  yearCount: 15,
  winRate: 66.7,
  mostTeam: "T1" as Team,
}

function InfoStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ReactNode
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

// export default를 붙여야 다른 파일(App.tsx)에서 이 블록을 불러와 쓸 수 있습니다!
export default function ProfileHeader() {
  return (
    <header className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)]" />
      <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
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